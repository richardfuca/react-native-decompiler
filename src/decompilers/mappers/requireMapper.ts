import { Visitor } from '@babel/traverse';
import { isIdentifier, stringLiteral } from '@babel/types';
import { Plugin } from '../../plugin';

export default class RequireMapper extends Plugin {
  readonly pass = 2;

  private requireRenamed = false;

  getVisitor(): Visitor {
    return {
      CallExpression: (path) => {
        if (!isIdentifier(path.node.callee)) return;

        const moduleDependency = this.getModuleDependency(path);
        if (moduleDependency == null) return;

        if (!this.requireRenamed) {
          this.requireRenamed = true;
          path.scope.rename(path.node.callee.name, 'require');
        }

        path.node.arguments[0] = stringLiteral(`${moduleDependency.isNpmModule ? '' : './'}${moduleDependency.moduleName}`);
        if (moduleDependency.isNpmModule && moduleDependency.npmModuleVarName) {
          const parent = path.parentPath;
          if (!parent.isVariableDeclarator()) return;
          if (!isIdentifier(parent.node.id)) return;

          path.scope.rename(parent.node.id.name, moduleDependency.npmModuleVarName);
        }
      },
    };
  }
}
