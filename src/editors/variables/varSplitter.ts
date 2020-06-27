import { variableDeclaration, VariableDeclaration } from '@babel/types';
import { Visitor, NodePath } from '@babel/traverse';
import { Plugin } from '../../plugin';

export default class VarSplitter extends Plugin {
  readonly pass = 1;

  readonly variablesToSplit: NodePath<VariableDeclaration>[] = [];

  getVisitor(): Visitor {
    return {
      VariableDeclaration: (path) => {
        if (path.node.declarations.length > 1) {
          this.variablesToSplit.push(path);
        }
      },
    };
  }

  afterPass(): void {
    this.variablesToSplit.forEach((path) => {
      path.replaceWithMultiple(path.node.declarations.map((declartion) => variableDeclaration(path.node.kind, [declartion])));
    });
  }
}
