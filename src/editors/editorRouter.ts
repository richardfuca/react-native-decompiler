import Module from '../module';
import { BlockStatement } from '@babel/types';
import { Editor, EditorConstructor } from './editor';

export default class EditorRouter {
  private readonly list: Editor[];
  constructor(list: EditorConstructor[], module: Module, moduleList: Module[]) {
    this.list = list.map(tagger => new tagger(module, moduleList));
  }

  parse = (block: BlockStatement) => {
    this.list.forEach(tagger => tagger.evaluate(block));
  }
}
