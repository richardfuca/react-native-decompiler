import { NodePath } from '@babel/traverse';
import { Identifier } from '@babel/types';
import { Decompiler } from '../decompiler';

export default class GlobalsRenamer extends Decompiler<Identifier> {
  actionable(path: NodePath<Identifier>): boolean {
    return path?.scope.getBindingIdentifier(path.node.name)?.start === this.module.globalsParam.start;
  }

  decompile(path: NodePath<Identifier>): void {
    path.node.name = 'globals';
  }
}
