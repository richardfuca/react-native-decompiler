/**
  React Native Decompiler
  Copyright (C) 2020 Richard Fu and contributors

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
import CmdArgs from './interfaces/cmdArgs';

export interface PluginConstructor<T extends Plugin = Plugin> {
  new(cmdArgs: CmdArgs, module: Module, moduleList: Module[]): T;
}

export abstract class Plugin {
  /** Which pass this plugin should run. Starts at pass #1. Set to 0 or less on construction to skip.  */
  abstract readonly pass: number;
  /** The name of the plugin */
  readonly name?: string;
  protected readonly cmdArgs: CmdArgs;
  protected readonly module: Module;
  protected readonly moduleList: Module[];

  constructor(cmdArgs: CmdArgs, module: Module, moduleList: Module[]) {
    this.cmdArgs = cmdArgs;
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
    if (!debug(`react-native-decompiler:${this.name ?? 'plugin'}`).enabled) return '';
    return generator({
      ...this.module.originalFile.program,
      type: 'Program',
      body: [isStatement(path.node) ? path.node : expressionStatement(path.node)],
    }).code;
  }

  protected navigateToModuleBody(path: NodePath<FunctionExpression>): NodePath<BlockStatement> {
    return path.get('body');
  }

  protected hasTag(tag: string): boolean {
    return this.module.tags.includes(tag);
  }

  protected addTag(tag: string): void {
    this.module.tags.push(tag);
  }

  protected getModuleDependency(path: NodePath<CallExpression>): Module | null {
    if (!isIdentifier(path.node.callee)) return null;
    if (!isNumericLiteral(path.node.arguments[0]) && !isMemberExpression(path.node.arguments[0]) && !isStringLiteral(path.node.arguments[0])) return null;
    if (path.scope.getBindingIdentifier(path.node.callee.name)?.start !== this.module.requireParam?.start) return null;

    if (isMemberExpression(path.node.arguments[0]) && isNumericLiteral(path.node.arguments[0].property)) {
      return this.moduleList[this.module.dependencies[path.node.arguments[0].property.value]] ?? null;
    }

    if (isStringLiteral(path.node.arguments[0])) {
      const nonNpmRegexTest = /\.\/([0-9]+)/.exec(path.node.arguments[0].value);
      if (nonNpmRegexTest != null) {
        return this.moduleList[this.module.dependencies[+nonNpmRegexTest[1]]];
      }
      return this.moduleList.find((mod) => isStringLiteral(path.node.arguments[0]) && mod?.moduleName === path.node.arguments[0].value) ?? null;
    }

    if (isNumericLiteral(path.node.arguments[0])) {
      return this.moduleList[this.module.dependencies[path.node.arguments[0].value]] ?? null;
    }

    return null;
  }
}
