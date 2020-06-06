import { Visitor } from '@babel/traverse';
import { isIdentifier, isMemberExpression, isCallExpression } from '@babel/types';
import { Plugin } from '../../plugin';

export default class RequireMapper extends Plugin {
  readonly pass = 1;

  getVisitor(): Visitor {
    return {
      VariableDeclarator: (path) => {
        if (!isCallExpression(path.node.init) || !isIdentifier(path.node.init.callee) || !isMemberExpression(path.node.init.arguments[0])) return;
        if (path.scope.getBindingIdentifier(path.node.init.callee.name)?.start !== this.module.requireParam.start) return;

        path.node.init.callee.name = 'require';

        const moduleDependency = this.moduleList[this.module.dependencies[path.node.init.arguments[0].property.value]];
        if (moduleDependency.isNpmModule && moduleDependency.npmModuleVarName) {
          if (!isIdentifier(path.node.id)) return;

          path.scope.rename(path.node.id.name, moduleDependency.npmModuleVarName);
        }
      },
    };
  }
}
