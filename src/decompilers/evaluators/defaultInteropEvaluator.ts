import { Visitor, NodePath } from '@babel/traverse';
import {
  isCallExpression,
  isIdentifier,
  VariableDeclarator,
  MemberExpression,
} from '@babel/types';
import { Plugin, PluginConstructor } from '../../plugin';
import RequiresAtTop from '../../editors/variables/requiresAtTop';
import Module from '../../module';

export default class DefaultInteropEvaluator extends Plugin {
  readonly pass = 1;
  private readonly INTEROP_MODULE_NAMES = [
    '@babel/runtime/helpers/interopRequireDefault',
    '@babel/runtime/helpers/interopRequireWildcard',
  ];

  private readonly interopUsed: boolean;
  private readonly possibleInteropedRequires: NodePath<VariableDeclarator>[] = [];
  private interopFunctionPaths: NodePath<VariableDeclarator>[] = [];
  private interopFunctionStarts: number[] = [];
  private readonly interopedModuleStarts: number[] = [];
  private readonly memberExpressions: { [index: number]: NodePath<MemberExpression>[] } = {};

  constructor(module: Module, moduleList: Module[]) {
    super(module, moduleList);

    const interopDependencies = moduleList.filter((mod) => this.INTEROP_MODULE_NAMES.includes(mod?.moduleName));
    this.interopUsed = interopDependencies.length > 0 && interopDependencies.some((mod) => module.dependencies.includes(mod.moduleId));
  }

  getVisitor(): Visitor {
    if (!this.interopUsed) return {};

    return {
      MemberExpression: (path) => {
        if (!isIdentifier(path.node.object)) return;

        const start = path.scope.getBindingIdentifier(path.node.object.name)?.start;
        if (start == null) return;

        if (!this.memberExpressions[start]) {
          this.memberExpressions[start] = [];
        }
        this.memberExpressions[start].push(path);
      },
      VariableDeclarator: (path) => {
        const callExpression = path.get('init');
        if (!callExpression.isCallExpression()) return;

        if (isIdentifier(callExpression.node.callee) && isCallExpression(callExpression.node.arguments[0])) {
          this.possibleInteropedRequires.push(path);
          return;
        }

        const moduleDependency = this.getModuleDependency(callExpression);
        if (this.INTEROP_MODULE_NAMES.includes(<string>moduleDependency?.moduleName) && path.node.id.start != null) {
          this.interopFunctionPaths.push(path);
          this.interopFunctionStarts.push(path.node.id.start);
        }
      },
    };
  }

  afterPass(rerunPlugin: (pluginConstructor: PluginConstructor) => void): void {
    if (!this.interopFunctionStarts.length || !this.interopFunctionPaths.length) return;
    this.possibleInteropedRequires.forEach((path) => {
      if (!isCallExpression(path.node.init) || !isIdentifier(path.node.init.callee) || !isCallExpression(path.node.init.arguments[0])) return;
      if (!this.interopFunctionStarts.includes(<number>path.scope.getBindingIdentifier(path.node.init.callee.name)?.start)) return;

      path.node.init = path.node.init.arguments[0];

      const callExpression = path.get('init');
      if (!callExpression.isCallExpression()) return;
      const moduleDependency = this.getModuleDependency(callExpression);
      if (!moduleDependency || moduleDependency.tags.includes('__esModule') || path.node.id.start == null) return;

      this.interopedModuleStarts.push(path.node.id.start);
    });
    this.interopedModuleStarts.forEach((start) => {
      if (!this.memberExpressions[start]) return;
      this.memberExpressions[start].forEach((path) => {
        path.replaceWith(path.node.object);
      });
    });

    this.interopFunctionPaths.forEach((path) => path.remove());
    rerunPlugin(RequiresAtTop);
  }
}
