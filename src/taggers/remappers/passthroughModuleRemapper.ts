import { Visitor } from '@babel/traverse';
import {
  isMemberExpression,
  isIdentifier,
  isCallExpression,
  isNumericLiteral,
} from '@babel/types';
import { Plugin } from '../../plugin';

/**
 * Resolves and bypasses modules that just export other modules.
 */
export default class PassthroughModuleRemapper extends Plugin {
  readonly pass = 1;

  getVisitor(): Visitor {
    if (this.module.moduleCode.body.length !== 1) return {};

    return {
      AssignmentExpression: (path) => {
        if (!isMemberExpression(path.node.left) || !isIdentifier(path.node.left?.object) || !isIdentifier(path.node.left?.property)) return;
        if (path.scope.getBindingIdentifier(path.node.left.object.name)?.start !== this.module.moduleParam?.start) return;
        if (path.node.left.property.name !== 'exports') return;

        if (!isCallExpression(path.node.right) || !isIdentifier(path.node.right.callee)) return;
        if (path.scope.getBindingIdentifier(path.node.right.callee.name)?.start !== this.module.requireParam?.start) return;
        if (!isMemberExpression(path.node.right.arguments[0]) || !isNumericLiteral(path.node.right?.arguments[0].property)) return;

        const passthroughDependency = this.moduleList[this.module.dependencies[path.node.right?.arguments[0].property.value]];
        this.module.ignored = true;
        this.module.isNpmModule = true; // flag as NPM module in case this module pass through NPM module
        this.moduleList.forEach((module) => {
          module.dependencies = module.dependencies.map((dep) => (dep === this.module.moduleId ? passthroughDependency.moduleId : dep));
        });
      },
    };
  }
}
