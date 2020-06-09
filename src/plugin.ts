import { CallExpression, BlockStatement, isFunctionExpression, isIdentifier, isMemberExpression } from '@babel/types';
import { NodePath, Visitor } from '@babel/traverse';
import Module from './module';

export interface PluginConstructor<T extends Plugin = Plugin> {
  new(module: Module, moduleList: Module[]): T;
}

export abstract class Plugin {
  /** Which pass this plugin should run. Starts at pass #1. Set to 0 or less on construction to skip.  */
  abstract readonly pass: number;
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

  /** Do a full evaluation. Use this for advanced plugins, or for super simple plugins that don't do traversals. */
  evaluate?(block: NodePath<CallExpression>, rerunPlugin: (pluginConstructor: PluginConstructor) => void): void;

  protected navigateToModuleBody(path: NodePath<CallExpression>): NodePath<BlockStatement> {
    if (!isFunctionExpression(path.node.arguments[0])) throw new Error('Path is not module body');
    const argumentsPath = path.get('arguments');
    if (!(argumentsPath instanceof Array)) throw new Error('Didnt get body path');
    const bodyPath = argumentsPath[0].get('body');
    if (bodyPath instanceof Array || !bodyPath.isBlockStatement()) throw new Error('Didnt get body path');
    return bodyPath;
  }

  protected getModuleDependency(path: NodePath<CallExpression>) {
    if (!isIdentifier(path.node.callee) || !isMemberExpression(path.node.arguments[0])) return null;
    if (path.scope.getBindingIdentifier(path.node.callee.name)?.start !== this.module.requireParam.start) return null;

    return this.moduleList[this.module.dependencies[path.node.arguments[0].property.value]];
  }
}
