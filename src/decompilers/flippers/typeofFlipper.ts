import { Visitor } from '@babel/traverse';
import { isUnaryExpression, isPrivateName } from '@babel/types';
import { Plugin } from '../../plugin';

export default class TypeofFlipper extends Plugin {
  readonly pass = 1;

  getVisitor(): Visitor {
    return {
      BinaryExpression(path) {
        if (!isUnaryExpression(path.node.right) || path.node.right.operator !== 'typeof') return;
        const tempLeft = path.node.left;
        if (isPrivateName(tempLeft)) return;

        path.node.left = path.node.right;
        path.node.right = tempLeft;
      },
    };
  }
}
