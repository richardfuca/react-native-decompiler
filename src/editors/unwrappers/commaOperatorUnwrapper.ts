import { Editor } from '../editor';
import { CallExpression, isSequenceExpression, isBlockStatement } from '@babel/types';
import { NodePath } from '@babel/traverse';

export default class CommaOperatorUnwrapper extends Editor {
  evaluate(path: NodePath<CallExpression>): void {
    path.traverse({
      ExpressionStatement(path) {
        if (!isSequenceExpression(path.node.expression)) return;
        if (!isBlockStatement(path.parent)) return;
        path.replaceWithMultiple(path.node.expression.expressions);
      },
    });
  }
}
