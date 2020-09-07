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
