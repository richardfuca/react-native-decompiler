import { Visitor } from '@babel/traverse';
import {
  isCallExpression,
  isBinaryExpression,
  ifStatement,
  expressionStatement,
  isLogicalExpression,
} from '@babel/types';
import { Plugin } from '../../plugin';

export default class HangingIfElseWrapper extends Plugin {
  readonly pass = 1;

  getVisitor(): Visitor {
    return {
      ExpressionStatement(path) {
        if (!isLogicalExpression(path.node.expression) || !isBinaryExpression(path.node.expression.left)) return;
        if (!isCallExpression(path.node.expression.right) || path.node.expression.operator !== '&&') return;

        path.replaceWith(ifStatement(path.node.expression.left, expressionStatement(path.node.expression.right)));
      },
    };
  }
}
