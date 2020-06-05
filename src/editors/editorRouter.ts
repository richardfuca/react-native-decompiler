import Module from '../module';
import { CallExpression } from '@babel/types';
import { Editor, EditorConstructor } from './editor';
import { NodePath } from '@babel/traverse';

export default class EditorRouter {
  private readonly list: Editor[];
  constructor(list: EditorConstructor[], module: Module, moduleList: Module[]) {
    this.list = list.map(tagger => new tagger(module, moduleList));
  }

  parse = (path: NodePath<CallExpression>) => {
    this.list.forEach(tagger => tagger.evaluate(path));
  }
}
