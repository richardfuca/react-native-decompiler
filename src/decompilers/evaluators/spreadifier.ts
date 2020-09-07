import { Visitor } from '@babel/traverse';
import {
  isIdentifier,
  isMemberExpression,
  Node,
  isCallExpression,
  isArrayExpression,
  spreadElement,
  Expression,
  isExpression,
} from '@babel/types';
import { Plugin } from '../../plugin';
/**
 * Coverts x.apply(x, [...]) into spreads)
 */
export default class Spreadifier extends Plugin {
  readonly pass = 1;

  getVisitor(): Visitor {
    return {
      CallExpression: (path) => {
        if (!isMemberExpression(path.node.callee)) return;
        if (!isIdentifier(path.node.callee.property) || path.node.callee.property.name !== 'apply') return;
        if (!isIdentifier(path.node.arguments[0]) || !isCallExpression(path.node.arguments[1]) || !isMemberExpression(path.node.arguments[1].callee)) return;
        if (!isArrayExpression(path.node.arguments[1].callee.object) || !isIdentifier(path.node.arguments[1].callee.property)) return;
        if (!isExpression(path.node.arguments[1].arguments[0]) || path.node.arguments[1].callee.property.name !== 'concat') return;

        let expectedThis: Node = path.node.callee;
        while (isMemberExpression(expectedThis)) {
          expectedThis = expectedThis.object;
        }
        if (!isIdentifier(expectedThis) || path.node.arguments[0].name !== expectedThis.name) return;

        path.node.callee = path.node.callee.object;

        const newAugments = [...path.node.arguments[1].callee.object.elements, spreadElement(path.node.arguments[1].arguments[0])];
        path.node.arguments = <Expression[]>newAugments;
      },
    };
  }
}
