import assert from 'assert';
import { NodePath } from '@babel/traverse';
import { UnaryExpression, isNumericLiteral, booleanLiteral } from '@babel/types';
import { Decompiler } from '../decompiler';

export default class LongBooleans extends Decompiler<UnaryExpression> {
  actionable(path: NodePath<UnaryExpression>): boolean {
    return path.node.operator === '!' && isNumericLiteral(path.node.argument) && (path.node.argument.value === 0 || path.node.argument.value === 1);
  }

  decompile(path: NodePath<UnaryExpression>): void {
    assert(isNumericLiteral(path.node.argument));
    path.replaceWith(booleanLiteral(!path.node.argument.value));
  }
}
