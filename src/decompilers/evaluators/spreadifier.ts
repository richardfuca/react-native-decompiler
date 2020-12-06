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
  isIdentifier,
  isMemberExpression,
  Node,
  isCallExpression,
  isArrayExpression,
  spreadElement,
  Expression,
  isExpression,
} from '@babel/types';
import { Plugin } from '../../plugin';
/**
 * Coverts x.apply(x, [...]) into spreads)
 */
export default class Spreadifier extends Plugin {
  readonly pass = 1;

  getVisitor(): Visitor {
    return {
      CallExpression: (path) => {
        const callee = path.get('callee');
        if (!callee.isMemberExpression()) return;
        if (!isIdentifier(callee.node.property) || callee.node.property.name !== 'apply') return;
        const args = path.get('arguments');
        if (!isIdentifier(args[0].node) || !isCallExpression(args[1].node) || !isMemberExpression(args[1].node.callee)) return;
        if (!isArrayExpression(args[1].node.callee.object) || !isIdentifier(args[1].node.callee.property)) return;
        if (!isExpression(args[1].node.arguments[0]) || args[1].node.callee.property.name !== 'concat') return;

        let expectedThis: Node = path.node.callee;
        while (isMemberExpression(expectedThis)) {
          expectedThis = expectedThis.object;
        }
        if (!isIdentifier(expectedThis) || args[0].node.name !== expectedThis.name) return;

        callee.replaceWith(callee.node.object);

        const newAugments = [...args[1].node.callee.object.elements, spreadElement(args[1].node.arguments[0])];
        path.node.arguments = <Expression[]>newAugments;
      },
    };
  }
}
