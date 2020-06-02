import { Decompiler, DecompilerConstructor } from './decompiler';
import Module from '../module';
import { NodePath } from '@babel/traverse';
import { Node } from '@babel/types';

export default class DecompilerRouter<T extends Node> {
  private readonly list: Decompiler<T>[];
  constructor(list: DecompilerConstructor<T>[], module: Module, moduleList: Module[]) {
    this.list = list.map(decompiler => new decompiler(module, moduleList));
  }

  parse = (path: NodePath<T>) => {
    this.list.forEach((decompiler) => {
      if (decompiler.actionable(path)) {
        decompiler.decompile(path);
      }
    });
  }
}
