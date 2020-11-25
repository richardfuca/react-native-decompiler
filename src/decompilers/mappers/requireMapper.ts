import { Visitor } from '@babel/traverse';
import { isIdentifier, stringLiteral } from '@babel/types';
import { Plugin } from '../../plugin';

/**
 * Maps the webpack requires to their file/NPM counterparts (that we generate)
 */
export default class RequireMapper extends Plugin {
  readonly pass = 2;

  getVisitor(): Visitor {
    return {
      CallExpression: (path) => {
        if (!isIdentifier(path.node.callee)) return;

        const moduleDependency = this.getModuleDependency(path);
        if (moduleDependency == null) return;

        path.get('arguments')[0].replaceWith(stringLiteral(`${moduleDependency.isNpmModule ? '' : './'}${moduleDependency.moduleName}`));
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
