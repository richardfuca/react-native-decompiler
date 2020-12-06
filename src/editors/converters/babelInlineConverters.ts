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

import { NodePath, Visitor } from '@babel/traverse';
import {
  callExpression,
  FunctionDeclaration,
  Identifier,
  identifier,
  isAssignmentExpression,
  isCallExpression,
  isConditionalExpression,
  isIdentifier,
  isLogicalExpression,
  isMemberExpression,
  isObjectExpression,
  isReturnStatement,
  stringLiteral,
  VariableDeclaration,
  variableDeclaration,
  VariableDeclarator,
  variableDeclarator,
} from '@babel/types';
import { Plugin } from '../../plugin';

/**
 * Converts inlines to requires for decompilers
 */
export default class BabelInlineConverters extends Plugin {
  readonly pass = 1;
  name = 'BabelInlineConverters';

  private interopRequireName?: string;

  getVisitor(): Visitor {
    return {
      FunctionDeclaration: (nodePath) => {
        this.interopRequireDefaultFunction(nodePath);
      },
      VariableDeclarator: (nodePath) => {
        this.interopRequireDefaultVarInline(nodePath);
      },
    };
  }

  private generateRequire(name: Identifier, requireModule: string): VariableDeclaration {
    return variableDeclaration('const', [
      variableDeclarator(name, callExpression(identifier('require'), [stringLiteral(requireModule)])),
    ]);
  }

  private interopRequireDefaultFunction(path: NodePath<FunctionDeclaration>) {
    const body = path.node.body.body;
    if (path.node.params.length !== 1 || body.length !== 1 || !isIdentifier(path.node.id) || !isReturnStatement(body[0])) return;
    if (!isConditionalExpression(body[0].argument) || !isLogicalExpression(body[0].argument.test)) return;
    if (!isIdentifier(body[0].argument.test.left) || body[0].argument.test.operator !== '&&' || !isMemberExpression(body[0].argument.test.right)) return;
    const esModuleExpression = body[0].argument.test.right;
    if (!isIdentifier(esModuleExpression.object) || !isIdentifier(esModuleExpression.property) || body[0].argument.test.left.name !== esModuleExpression.object.name) return;
    if (esModuleExpression.property.name !== '__esModule') return;

    this.debugLog(`${this.module.moduleId} removed inline babel interopRequireDefault function:`);
    this.debugLog(this.debugPathToCode(path));

    if (this.interopRequireName) {
      path.scope.rename(path.node.id.name, this.interopRequireName);
      path.remove();
    } else {
      this.interopRequireName = path.node.id.name;
      path.replaceWith(this.generateRequire(path.node.id, '@babel/runtime/helpers/interopRequireDefault'));
    }
    this.addTag('babel-interop');
  }

  private interopRequireDefaultVarInline(path: NodePath<VariableDeclarator>) {
    const node = path.node;
    if (!isConditionalExpression(node.init) || !isLogicalExpression(node.init.test) || !isIdentifier(node.init.consequent) || !isObjectExpression(node.init.alternate)) return;
    const test = node.init.test;
    if (!isAssignmentExpression(test.left) || !isIdentifier(test.left.left) || !isIdentifier(test.left.right)) return;
    if (!isMemberExpression(test.right) || !isIdentifier(test.right.object) || !isIdentifier(test.right.property)) return;
    if (test.left.left.name !== test.right.object.name || test.right.property.name !== '__esModule') return;

    const moduleSource = path.scope.getBinding(test.left.right.name);
    if (!moduleSource) return;
    const moduleSourcePath = moduleSource.path.find((p) => p.isVariableDeclarator());
    if (moduleSourcePath == null || !moduleSourcePath.isVariableDeclarator() || !isCallExpression(moduleSourcePath.node.init)) return;

    this.debugLog(`${this.module.moduleId} removed inline babel interopRequireDefault inline:`);
    this.debugLog(this.debugPathToCode(path));

    if (!this.interopRequireName) {
      this.interopRequireName = 'interopRequireDefault';
      path.parentPath.insertBefore(this.generateRequire(identifier('interopRequireDefault'), '@babel/runtime/helpers/interopRequireDefault'));
    }

    path.get('init').replaceWith(callExpression(identifier(this.interopRequireName), [moduleSourcePath.node.init]));
    this.addTag('babel-interop');
  }
}
