import assert from 'assert';
import { NodePath } from '@babel/traverse';
import { CallExpression } from '@babel/types';
import { Decompiler } from '../decompiler';
import { parseExpression } from '@babel/parser';

export default class RequireMapper extends Decompiler<CallExpression> {
  actionable(path: NodePath<CallExpression>): boolean {
    return path.node.callee.type === 'Identifier' && path.scope.bindings[path.node.callee.name] != null &&
      path.scope.bindings[path.node.callee.name].identifier?.start === this.module.requireParam.start;
  }

  decompile(path: NodePath<CallExpression>): void {
    assert(path.node.callee.type === 'Identifier');
    assert(path.node.arguments[0].type === 'MemberExpression');

    path.node.callee.name = 'require';
    const moduleDependency = this.moduleList[this.module.dependencies[path.node.arguments[0].property.value]];
    path.node.arguments[0] = parseExpression(moduleDependency.isNpmModule ?
      `'${moduleDependency.moduleName}'` :
      `'./${moduleDependency.moduleName}'`);
  }
}
