import Module from '../module';
import { NodePath } from '@babel/traverse';
import { CallExpression } from '@babel/types';
import { Tagger, TaggerConstructor } from './tagger';

export default class TaggerRouter {
  private readonly list: Tagger[];
  constructor(list: TaggerConstructor[], module: Module, moduleList: Module[]) {
    this.list = list.map(tagger => new tagger(module, moduleList));
  }

  parse = (path: NodePath<CallExpression>) => {
    this.list.forEach(tagger => tagger.evaluate(path));
  }
}
