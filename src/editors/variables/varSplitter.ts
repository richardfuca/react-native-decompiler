import { Editor } from '../editor';
import { variableDeclaration, CallExpression } from '@babel/types';
import { NodePath } from '@babel/traverse';

export default class VarSplitter extends Editor {
  evaluate(path: NodePath<CallExpression>): void {
    path.traverse({
      VariableDeclaration(path) {
        if (path.node.declarations.length > 1) {
          path.replaceWithMultiple(path.node.declarations.map(declartion => variableDeclaration(path.node.kind, [declartion])));
        }
        path.skip();
      },
    });
  }
}
