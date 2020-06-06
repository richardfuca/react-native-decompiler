import { Visitor } from '@babel/traverse';
import { isIdentifier, isMemberExpression } from '@babel/types';
import { Plugin } from '../../plugin';

export default class WebpackRenamer extends Plugin {
  readonly pass = 1;

  getVisitor(): Visitor {
    return {
      AssignmentExpression: (path) => {
        if (!isMemberExpression(path.node.left) || !isIdentifier(path.node.left.object)) return;
        const bindingStart = path.scope.getBindingIdentifier(path.node.left.object.name)?.start;
        if (bindingStart === this.module.moduleObjParam.start) {
          path.node.left.object.name = 'module';
        } else if (bindingStart === this.module.exportsParam.start) {
          path.node.left.object.name = 'exports';
        } else if (bindingStart === this.module.globalsParam.start) {
          path.node.left.object.name = 'globals';
        }
      },
    };
  }
}
