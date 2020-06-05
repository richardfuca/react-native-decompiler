import { Editor } from '../editor';
import { CallExpression, Statement, isVariableDeclaration, isCallExpression, isIdentifier } from '@babel/types';
import { NodePath } from '@babel/traverse';

export default class RequiresAtTop extends Editor {
  evaluate(path: NodePath<CallExpression>): void {
    path.traverse({
      BlockStatement: (blockPath) => {
        const staging: Statement[] = [];
        blockPath.node.body.forEach((line) => {
          if (!isVariableDeclaration(line)) return staging.push(line);
          if (!isCallExpression(line.declarations[0].init)) return staging.push(line);
          if (!isIdentifier(line.declarations[0].init.callee)) return staging.push(line);
          if (blockPath.scope.getBindingIdentifier(line.declarations[0].init.callee.name)?.start !== this.module.requireParam.start) {
            return staging.push(line);
          }
          return staging.unshift(line);
        });
        blockPath.node.body = staging;
        blockPath.stop();
      },
    });
  }
}
