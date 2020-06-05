import { NodePath } from '@babel/traverse';
import { UnaryExpression, identifier, isNumericLiteral } from '@babel/types';
import { Decompiler } from '../decompiler';

export default class VoidZeroToUndefined extends Decompiler<UnaryExpression> {
  actionable(path: NodePath<UnaryExpression>): boolean {
    return path.node.operator === 'void' && isNumericLiteral(path.node.argument) && path.node.argument.value === 0;
  }

  decompile(path: NodePath<UnaryExpression>): void {
    path.replaceWith(identifier('undefined'));
  }
}
