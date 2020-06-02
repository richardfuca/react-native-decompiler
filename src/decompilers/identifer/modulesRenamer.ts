import { NodePath } from '@babel/traverse';
import { Identifier } from '@babel/types';
import { Decompiler } from '../decompiler';

export default class ModulesRenamer extends Decompiler<Identifier> {
  actionable(path: NodePath<Identifier>): boolean {
    return path?.scope?.bindings?.[path.node.name]?.identifier?.start === this.module.moduleObjParam.start;
  }

  decompile(path: NodePath<Identifier>): void {
    path.node.name = 'module';
  }
}
