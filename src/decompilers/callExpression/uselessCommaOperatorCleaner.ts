import assert from 'assert';
import { NodePath } from '@babel/traverse';
import { CallExpression } from '@babel/types';
import { Decompiler } from '../decompiler';

export default class UselessCommaOperatorCleaner extends Decompiler<CallExpression> {
  actionable(path: NodePath<CallExpression>): boolean {
    return path.node.callee.type === 'SequenceExpression' && path.node.callee.expressions.length === 2 &&
      path.node.callee.expressions[0].type === 'NumericLiteral';
  }

  decompile(path: NodePath<CallExpression>): void {
    assert(path.node.callee.type === 'SequenceExpression');
    path.node.callee = path.node.callee.expressions[1];
  }
}
