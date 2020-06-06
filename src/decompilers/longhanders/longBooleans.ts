import { Visitor } from '@babel/traverse';
import { isNumericLiteral, booleanLiteral } from '@babel/types';
import { Plugin } from '../../plugin';

export default class LongBooleans extends Plugin {
  readonly pass = 1;

  getVisitor(): Visitor {
    return {
      UnaryExpression(path) {
        const node = path.node;
        if (node.operator !== '!' || !isNumericLiteral(node.argument) || (node.argument.value !== 0 && node.argument.value !== 1)) return;
        path.replaceWith(booleanLiteral(!node.argument.value));
      },
    };
  }
}
