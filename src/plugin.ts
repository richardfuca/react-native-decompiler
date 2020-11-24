import {
  CallExpression,
  BlockStatement,
  isIdentifier,
  isMemberExpression,
  isNumericLiteral,
  isStringLiteral,
  expressionStatement,
  isStatement,
  FunctionExpression,
} from '@babel/types';
import generator from '@babel/generator';
import { NodePath, Visitor } from '@babel/traverse';
import debug from 'debug';
import Module from './module';

export interface PluginConstructor<T extends Plugin = Plugin> {
  new(module: Module, moduleList: Module[]): T;
}

export abstract class Plugin {
  /** Which pass this plugin should run. Starts at pass #1. Set to 0 or less on construction to skip.  */
  abstract readonly pass: number;
  /** The name of the plugin */
  readonly name?: string;
  protected readonly module: Module;
  protected readonly moduleList: Module[];

  constructor(module: Module, moduleList: Module[]) {
    this.module = module;
    this.moduleList = moduleList;
  }

  /**
   * Get a visitor that contains the plugin parsing. Use this for simplier plugins.
   * Do not use path.skip() or path.stop() if your plugin uses this method.
   */
  getVisitor?(rerunPlugin: (pluginConstructor: PluginConstructor) => void): Visitor;

  /** Do a full evaluation. Use this for advanced plugins, or for plugins that don't do traversals. */
  evaluate?(block: NodePath<FunctionExpression>, rerunPlugin: (pluginConstructor: PluginConstructor) => void): void;

  /** Runs after the pass completes. Note that the AST of the module may have changed if you stored stuff in getVisitor or evaluate. */
  afterPass?(rerunPlugin: (pluginConstructor: PluginConstructor) => void): void;

  protected debugLog(val: unknown): void {
    debug(`react-native-decompiler:${this.name ?? 'plugin'}`)(val);
  }

  /**
   * [DEBUG] Returns the code of the path
   * @param path The path to generate code from
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected debugPathToCode(path: NodePath<any>): string {
    return generator({
      ...this.module.originalFile.program,
      type: 'Program',
      body: [isStatement(path.node) ? path.node : expressionStatement(path.node)],
    }).code;
  }

  protected navigateToModuleBody(path: NodePath<FunctionExpression>): NodePath<BlockStatement> {
    return path.get('body');
  }

  protected getModuleDependency(path: NodePath<CallExpression>): Module | null {
    if (!isIdentifier(path.node.callee) || (!isMemberExpression(path.node.arguments[0]) && !isStringLiteral(path.node.arguments[0]))) return null;
    if (path.scope.getBindingIdentifier(path.node.callee.name)?.start !== this.module.requireParam?.start) return null;

    if (isMemberExpression(path.node.arguments[0]) && isNumericLiteral(path.node.arguments[0].property)) {
      return this.moduleList[this.module.dependencies[path.node.arguments[0].property.value]];
    }

    if (isStringLiteral(path.node.arguments[0])) {
      const nonNpmRegexTest = /\.\/([0-9]+)/.exec(path.node.arguments[0].value);
      if (nonNpmRegexTest != null) {
        return this.moduleList[this.module.dependencies[+nonNpmRegexTest[1]]];
      }
      return this.moduleList.find((mod) => isStringLiteral(path.node.arguments[0]) && mod?.moduleName === path.node.arguments[0].value) ?? null;
    }

    return null;
  }
}
