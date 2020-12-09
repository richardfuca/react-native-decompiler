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

import { Visitor } from '@babel/traverse';
import {
  exportDefaultDeclaration,
  exportNamedDeclaration,
  functionDeclaration,
  isAssignmentExpression,
  isFunctionExpression,
  isIdentifier,
  isMemberExpression,
  isObjectExpression,
  variableDeclaration,
  variableDeclarator,
} from '@babel/types';
import { Plugin } from '../../plugin';

/**
 * Convertes exports.? into ES6 named exports
 */
export default class ExportsToEs6 extends Plugin {
  readonly pass = 2;

  getVisitor(): Visitor {
    if (!this.cmdArgs.es6 || !this.module.tags.includes('__esModule')) return {};
    return {
      ExpressionStatement: (path) => {
        if (!isAssignmentExpression(path.node.expression)) return;
        const node = path.node.expression;
        if (!isMemberExpression(node.left) || !isIdentifier(node.left.object) || !isIdentifier(node.left.property)) return;
        if (node.left.object.name !== 'exports') return;

        const isDefault = node.left.property.name === 'default';
        const exportType = isDefault ? exportDefaultDeclaration : exportNamedDeclaration;

        if (isObjectExpression(node.right) && !isDefault) {
          const exportNode = exportNamedDeclaration(variableDeclaration('const', [variableDeclarator(node.left.property, node.right)]));
          path.replaceWith(exportNode);
        } else if (isFunctionExpression(node.right)) {
          const exportNode = exportType(functionDeclaration(node.left.property, node.right.params, node.right.body));
          path.replaceWith(exportNode);
        } else if (isIdentifier(node.right) && isDefault) {
          const exportNode = exportDefaultDeclaration(node.right);
          path.replaceWith(exportNode);
        }
      },
    };
  }
}
