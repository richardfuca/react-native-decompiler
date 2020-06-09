import { Visitor } from '@babel/traverse';
import { isIdentifier, stringLiteral } from '@babel/types';
import { Plugin } from '../../plugin';

export default class RequireMapper extends Plugin {
  readonly pass = 2;

  getVisitor(): Visitor {
    return {
      VariableDeclarator: (path) => {
        const callExpression = path.get('init');
        if (!callExpression.isCallExpression() || !isIdentifier(callExpression.node.callee)) return;

        const moduleDependency = this.getModuleDependency(callExpression);
        if (moduleDependency == null) return;

        callExpression.node.callee.name = 'require';

        callExpression.node.arguments[0] = stringLiteral(`${moduleDependency.isNpmModule ? '' : './'}${moduleDependency.moduleName}`);
        if (moduleDependency.isNpmModule && moduleDependency.npmModuleVarName) {
          if (!isIdentifier(path.node.id)) return;

          path.scope.rename(path.node.id.name, moduleDependency.npmModuleVarName);
        }
      },
    };
  }
}
