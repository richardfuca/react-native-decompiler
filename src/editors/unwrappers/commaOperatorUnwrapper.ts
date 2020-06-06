import { isSequenceExpression, isBlockStatement } from '@babel/types';
import { Visitor } from '@babel/traverse';
import { Plugin } from '../../plugin';

export default class CommaOperatorUnwrapper extends Plugin {
  readonly pass = 1;

  getVisitor(): Visitor {
    return {
      ExpressionStatement(path) {
        if (!isSequenceExpression(path.node.expression)) return;
        if (!isBlockStatement(path.parent)) return;
        path.replaceWithMultiple(path.node.expression.expressions);
      },
    };
  }
}
