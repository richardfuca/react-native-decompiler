import { Visitor } from '@babel/traverse';
import {
  isMemberExpression,
  isIdentifier,
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

        const right = path.get('right');
        if (!right.isCallExpression() || !isIdentifier(right.node.callee)) return;
        const dependency = this.getModuleDependency(right);
        if (!dependency) return;

        const passthroughDependency = this.moduleList[dependency.moduleId];
        this.module.ignored = true;
        this.module.isNpmModule = true; // flag as NPM module in case this module pass through NPM module
        this.moduleList.forEach((module) => {
          module.dependencies = module.dependencies.map((dep) => (dep === this.module.moduleId ? passthroughDependency.moduleId : dep));
        });
      },
    };
  }
}
