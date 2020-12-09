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
import * as t from '@babel/types';
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
        if (!t.isBlockStatement(path.parent)) return;

        if (t.isLogicalExpression(path.node.expression) && path.node.expression.operator === '&&') {
          this.convertShorthandIfTrue(path, path.node.expression);
        } else if (t.isConditionalExpression(path.node.expression)) {
          this.convertShorthandIfElse(path, path.node.expression);
        }
      },
    };
  }

  private convertShorthandIfTrue(path: NodePath<t.ExpressionStatement>, expression: t.LogicalExpression): void {
    this.debugLog(this.debugPathToCode(path));
    path.replaceWith(this.parseConditionalIfTrue(expression));
  }

  private parseConditionalIfTrue(expression: t.LogicalExpression): t.IfStatement {
    return t.ifStatement(expression.left, t.expressionStatement(expression.right));
  }

  private convertShorthandIfElse(path: NodePath<t.ExpressionStatement>, cond: t.ConditionalExpression): void {
    this.debugLog(this.debugPathToCode(path));
    path.replaceWith(this.parseConditionalToIfElse(cond));
  }

  private parseConditionalToIfElse(cond: t.ConditionalExpression): t.IfStatement {
    const elseBlock = t.isConditionalExpression(cond.alternate) ? this.parseConditionalToIfElse(cond.alternate) : this.convertToBody(cond.alternate);
    return t.ifStatement(cond.test, this.convertToBody(cond.consequent), elseBlock);
  }

  private convertToBody(e: t.Node): t.Statement {
    if (t.isSequenceExpression(e)) {
      return t.blockStatement(e.expressions.map((exp) => t.expressionStatement(exp)));
    }
    if (t.isLogicalExpression(e)) {
      return this.parseConditionalIfTrue(e);
    }
    return t.isStatement(e) ? e : t.expressionStatement(e);
  }
}
