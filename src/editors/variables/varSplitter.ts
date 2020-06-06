import { variableDeclaration } from '@babel/types';
import { Visitor } from '@babel/traverse';
import { Plugin } from '../../plugin';

export default class VarSplitter extends Plugin {
  readonly pass = 1;

  getVisitor(): Visitor {
    return {
      VariableDeclaration(path) {
        if (path.node.declarations.length > 1) {
          path.replaceWithMultiple(path.node.declarations.map(declartion => variableDeclaration(path.node.kind, [declartion])));
        }
      },
    };
  }
}
