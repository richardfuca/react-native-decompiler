import { Visitor } from '@babel/traverse';
import { isUnaryExpression } from '@babel/types';
import { Plugin } from '../../plugin';

export default class TypeofFlipper extends Plugin {
  readonly pass = 1;

  getVisitor(): Visitor {
    return {
      BinaryExpression(path) {
        if (!isUnaryExpression(path.node.right) || path.node.right.operator !== 'typeof') return;
        const tempLeft = path.node.left;
        path.node.left = path.node.right;
        path.node.right = tempLeft;
      },
    };
  }
}
