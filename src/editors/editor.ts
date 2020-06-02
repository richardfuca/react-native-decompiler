import Module from '../module';
import { BlockStatement } from '@babel/types';

export interface EditorConstructor {
  new(module: Module, moduleList: Module[]): Editor;
}

export abstract class Editor {
  protected readonly module: Module;
  protected readonly moduleList: Module[];

  constructor(module: Module, moduleList: Module[]) {
    this.module = module;
    this.moduleList = moduleList;
  }

  abstract evaluate(block: BlockStatement): void;
}
