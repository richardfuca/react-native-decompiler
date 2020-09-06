import { Visitor } from '@babel/traverse';
import {
  isUnaryExpression,
  isPrivateName,
  isIdentifier,
  isStringLiteral,
} from '@babel/types';
import { Plugin } from '../../plugin';

/**
 * Flips conditions to improve readability, for example `'number' === typeof 1234` and `undefined === variable`
 */
export default class ConditionFlipper extends Plugin {
  readonly pass = 2;

  getVisitor(): Visitor {
    return {
      BinaryExpression: (path) => {
        if (isPrivateName(path.node.left)) return;

        const undefinedNullCond = isIdentifier(path.node.left) && (path.node.left.name === 'undefined' || path.node.left.name === 'null');
        const stringCond = isStringLiteral(path.node.left) && (isIdentifier(path.node.right) || isUnaryExpression(path.node.right));
        if (undefinedNullCond || stringCond) {
          const tempLeft = path.node.left;

          path.node.left = path.node.right;
          path.node.right = tempLeft;
        }
      },
    };
  }
}
