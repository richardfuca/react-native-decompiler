import { Visitor } from '@babel/traverse';
import { isIdentifier, isMemberExpression } from '@babel/types';
import { Plugin } from '../../plugin';

/**
 * Renames the webpack variables to the node variants
 */
export default class WebpackRenamer extends Plugin {
  readonly pass = 1;

  private moduleRenamed = false;
  private exportsRenamed = false;
  private globalsRenamed = false;

  getVisitor(): Visitor {
    return {
      AssignmentExpression: (path) => {
        if (this.moduleRenamed && this.exportsRenamed && this.globalsRenamed) return;
        if (!isMemberExpression(path.node.left) || !isIdentifier(path.node.left.object)) return;
        const bindingStart = path.scope.getBindingIdentifier(path.node.left.object.name)?.start;
        if (!this.moduleRenamed && bindingStart === this.module.moduleObjParam.start) {
          this.moduleRenamed = true;
          path.scope.rename(path.node.left.object.name, 'module');
        } else if (!this.exportsRenamed && bindingStart === this.module.exportsParam.start) {
          this.exportsRenamed = true;
          path.scope.rename(path.node.left.object.name, 'exports');
        } else if (!this.globalsRenamed && bindingStart === this.module.globalsParam.start) {
          this.globalsRenamed = true;
          path.scope.rename(path.node.left.object.name, 'globals');
        }
      },
    };
  }
}
