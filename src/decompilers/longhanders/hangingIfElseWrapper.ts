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
  isCallExpression,
  isBinaryExpression,
  ifStatement,
  expressionStatement,
  isLogicalExpression,
} from '@babel/types';
import { Plugin } from '../../plugin';

/**
 * Converts `cond && statement` to `if (cond) statement`
 */
export default class HangingIfElseWrapper extends Plugin {
  readonly pass = 1;
  readonly name = 'HangingIfElseWrapper';

  getVisitor(): Visitor {
    return {
      ExpressionStatement: (path) => {
        if (!isLogicalExpression(path.node.expression) || (!isBinaryExpression(path.node.expression.left) && !isLogicalExpression(path.node.expression.left))) return;
        if (!isCallExpression(path.node.expression.right) || path.node.expression.operator !== '&&') return;

        this.debugLog(this.debugPathToCode(path));
        path.replaceWith(ifStatement(path.node.expression.left, expressionStatement(path.node.expression.right)));
      },
    };
  }
}
