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

import { Visitor, NodePath } from '@babel/traverse';
import {
  isCallExpression,
  isIdentifier,
  isStringLiteral,
  VariableDeclarator,
  MemberExpression,
} from '@babel/types';
import { Plugin, PluginConstructor } from '../../plugin';
import RequiresAtTop from '../../editors/variables/requiresAtTop';
import Module from '../../module';
import CmdArgs from '../../interfaces/cmdArgs';

/**
 * Evaluates babel default interops
 */
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

  constructor(args: CmdArgs, module: Module, moduleList: Module[]) {
    super(args, module, moduleList);

    const interopDependencies = moduleList.filter((mod) => this.INTEROP_MODULE_NAMES.includes(mod?.moduleName));
    this.interopUsed = this.hasTag('babel-interop') || (interopDependencies.length > 0 && interopDependencies.some((mod) => module.dependencies.includes(mod.moduleId)));
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

        const requireValue = isStringLiteral(callExpression.node.arguments[0]) ? callExpression.node.arguments[0].value : null;
        const dependencyName = this.getModuleDependency(callExpression)?.moduleName ?? requireValue ?? '';
        if (this.INTEROP_MODULE_NAMES.includes(dependencyName) && path.node.id.start != null) {
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
