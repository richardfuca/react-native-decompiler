import {
  CallExpression,
  Statement,
  isVariableDeclaration,
  isCallExpression,
  isIdentifier,
} from '@babel/types';
import { NodePath } from '@babel/traverse';
import { Plugin } from '../../plugin';

export default class RequiresAtTop extends Plugin {
  readonly pass = 2;

  evaluate(path: NodePath<CallExpression>): void {
    const bodyPath = this.navigateToModuleBody(path);
    const staging: Statement[] = [];

    bodyPath.node.body.forEach((line) => {
      if (!isVariableDeclaration(line)) return staging.push(line);
      if (!isCallExpression(line.declarations[0].init)) return staging.push(line);
      if (!isIdentifier(line.declarations[0].init.callee)) return staging.push(line);
      if (bodyPath.scope.getBindingIdentifier(line.declarations[0].init.callee.name)?.start !== this.module.requireParam.start) {
        return staging.push(line);
      }
      return staging.unshift(line);
    });
    bodyPath.node.body = staging;
  }
}
