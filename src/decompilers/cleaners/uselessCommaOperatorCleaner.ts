import { Visitor } from '@babel/traverse';
import { isNumericLiteral } from '@babel/types';
import { Plugin } from '../../plugin';

export default class UselessCommaOperatorCleaner extends Plugin {
  readonly pass = 1;

  getVisitor(): Visitor {
    return {
      SequenceExpression(path) {
        if (path.node.expressions.length !== 2 || !isNumericLiteral(path.node.expressions[0])) return;
        path.replaceWith(path.node.expressions[1]);
      },
    };
  }
}
