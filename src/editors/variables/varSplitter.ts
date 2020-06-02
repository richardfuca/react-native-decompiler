import { Editor } from '../editor';
import { BlockStatement, Statement, variableDeclaration } from '@babel/types';

export default class VarSplitter extends Editor {
  evaluate(block: BlockStatement): void {
    const staging: (Statement | Statement[])[] = block.body.map((line) => {
      if (line.type !== 'VariableDeclaration') return line;
      if (line.declarations.length <= 1) return line;
      return line.declarations.map(declartion => variableDeclaration(line.kind, [declartion]));
    });
    block.body = staging.flat();
  }
}
