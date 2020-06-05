import assert from 'assert';
import { NodePath } from '@babel/traverse';
import { CallExpression, isSequenceExpression, isNumericLiteral } from '@babel/types';
import { Decompiler } from '../decompiler';

export default class UselessCommaOperatorCleaner extends Decompiler<CallExpression> {
  actionable(path: NodePath<CallExpression>): boolean {
    return isSequenceExpression(path.node.callee) && path.node.callee.expressions.length === 2 && isNumericLiteral(path.node.callee.expressions[0]);
  }

  decompile(path: NodePath<CallExpression>): void {
    assert(isSequenceExpression(path.node.callee));
    path.node.callee = path.node.callee.expressions[1];
  }
}
