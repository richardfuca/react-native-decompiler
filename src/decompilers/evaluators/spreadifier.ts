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
        const callee = path.get('callee');
        if (!callee.isMemberExpression()) return;
        if (!isIdentifier(callee.node.property) || callee.node.property.name !== 'apply') return;
        const args = path.get('arguments');
        if (!isIdentifier(args[0].node) || !isCallExpression(args[1].node) || !isMemberExpression(args[1].node.callee)) return;
        if (!isArrayExpression(args[1].node.callee.object) || !isIdentifier(args[1].node.callee.property)) return;
        if (!isExpression(args[1].node.arguments[0]) || args[1].node.callee.property.name !== 'concat') return;

        let expectedThis: Node = path.node.callee;
        while (isMemberExpression(expectedThis)) {
          expectedThis = expectedThis.object;
        }
        if (!isIdentifier(expectedThis) || args[0].node.name !== expectedThis.name) return;

        callee.replaceWith(callee.node.object);

        const newAugments = [...args[1].node.callee.object.elements, spreadElement(args[1].node.arguments[0])];
        path.node.arguments = <Expression[]>newAugments;
      },
    };
  }
}
