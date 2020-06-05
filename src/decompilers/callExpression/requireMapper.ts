import assert from 'assert';
import { NodePath } from '@babel/traverse';
import { CallExpression, isIdentifier, isMemberExpression, stringLiteral, isVariableDeclarator } from '@babel/types';
import { Decompiler } from '../decompiler';

export default class RequireMapper extends Decompiler<CallExpression> {
  actionable(path: NodePath<CallExpression>): boolean {
    return isIdentifier(path.node.callee) && path.scope.getBindingIdentifier(path.node.callee.name)?.start === this.module.requireParam.start;
  }

  decompile(path: NodePath<CallExpression>): void {
    assert(isIdentifier(path.node.callee));
    assert(isMemberExpression(path.node.arguments[0]));

    path.node.callee.name = 'require';
    const moduleDependency = this.moduleList[this.module.dependencies[path.node.arguments[0].property.value]];
    path.node.arguments[0] = stringLiteral(`${moduleDependency.isNpmModule ? '' : './'}${moduleDependency.moduleName}`);
    if (moduleDependency.isNpmModule && moduleDependency.npmModuleVarName) {
      if (!isVariableDeclarator(path.parent)) return;
      if (!isIdentifier(path.parent.id)) return;

      path.scope.rename(path.parent.id.name, moduleDependency.npmModuleVarName);
    }
  }
}
