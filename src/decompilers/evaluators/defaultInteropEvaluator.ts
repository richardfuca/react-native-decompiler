import { Visitor } from '@babel/traverse';
import { isCallExpression, isIdentifier } from '@babel/types';
import { Plugin, PluginConstructor } from '../../plugin';
import RequiresAtTop from '../../editors/variables/requiresAtTop';

export default class DefaultInteropEvaluator extends Plugin {
  readonly pass = 1;

  getVisitor(rerunPlugin: (pluginConstructor: PluginConstructor) => void): Visitor {
    return {
      VariableDeclarator: (path) => {
        const callExpression = path.get('init');
        if (!callExpression.isCallExpression()) return;

        const moduleDependency = this.getModuleDependency(callExpression);
        if (moduleDependency == null || moduleDependency.moduleName !== '@babel/runtime/helpers/interopRequireDefault') return;

        const requireVarStart = path.node.id.start;

        const interopedModuleStarts: number[] = [];

        const subVisitor: Visitor = {
          VariableDeclarator: (path) => {
            const node = path.node;
            if (!isCallExpression(node.init) || !isIdentifier(node.init.callee) || !isCallExpression(node.init.arguments[0])) return;
            if (path.scope.getBindingIdentifier(node.init.callee.name)?.start !== requireVarStart) return;

            node.init = node.init.arguments[0];

            const callExpression = path.get('init');
            if (!callExpression.isCallExpression()) return;
            const moduleDependency = this.getModuleDependency(callExpression);
            if (!moduleDependency || moduleDependency.tags.includes('__esModule') || path.node.id.start == null) return;

            interopedModuleStarts.push(path.node.id.start);
          },
        };

        const subsubVisitor: Visitor = {
          MemberExpression: (path) => {
            if (!isIdentifier(path.node.object)) return;
            if (!interopedModuleStarts.includes(<number>path.scope.getBindingIdentifier(path.node.object.name)?.start)) return;

            path.replaceWith(path.node.object);
          },
        };

        this.module.path.traverse(subVisitor);
        this.module.path.traverse(subsubVisitor);

        rerunPlugin(RequiresAtTop);
      },
    };
  }
}
