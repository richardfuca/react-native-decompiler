import {
  CallExpression,
  Statement,
  isVariableDeclaration,
  isCallExpression,
  isIdentifier,
} from '@babel/types';
import { NodePath } from '@babel/traverse';
import { Plugin } from '../../plugin';

/**
 * Moves all requires to the top of the file
 */
export default class RequiresAtTop extends Plugin {
  readonly pass = 2;

  evaluate(path: NodePath<CallExpression>): void {
    const bodyPath = this.navigateToModuleBody(path);
    const staging: Statement[] = [];

    bodyPath.node.body.forEach((line) => {
      if (!isVariableDeclaration(line) || !isCallExpression(line.declarations[0].init) || !isIdentifier(line.declarations[0].init.callee)) return staging.push(line);
      if (!bodyPath.scope.bindingIdentifierEquals(line.declarations[0].init.callee.name, this.module.requireParam)) return staging.push(line);

      return staging.unshift(line);
    });
    bodyPath.node.body = staging;
  }
}
