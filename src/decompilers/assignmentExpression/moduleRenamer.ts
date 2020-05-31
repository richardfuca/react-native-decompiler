import assert from 'assert';
import { NodePath } from '@babel/traverse';
import { AssignmentExpression } from '@babel/types';
import { Decompiler } from '../decompiler';

export default class ModuleRenamer extends Decompiler<AssignmentExpression> {
  actionable(path: NodePath<AssignmentExpression>): boolean {
    return path.node.operator === '=' && path.node.left?.type === 'MemberExpression' &&
      path.node.left?.object?.type === 'Identifier' && path.scope.bindings[path.node.left?.object?.name] != null &&
      path.scope.bindings[path.node.left.object.name].identifier.start === this.module.moduleObjParam.start;
  }

  decompile(path: NodePath<AssignmentExpression>): void {
    assert(path.node.left?.type === 'MemberExpression' && path.node.left?.object?.type === 'Identifier');
    path.node.left.object.name = 'module';
  }
}
