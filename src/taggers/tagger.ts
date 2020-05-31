import { NodePath } from '@babel/traverse';
import Module from '../module';
import { CallExpression } from '@babel/types';

export interface TaggerConstructor {
  new(module: Module, moduleList: Module[]): Tagger;
}

export abstract class Tagger {
  protected readonly module: Module;
  protected readonly moduleList: Module[];

  constructor(module: Module, moduleList: Module[]) {
    this.module = module;
    this.moduleList = moduleList;
  }

  abstract evaluate(path: NodePath<CallExpression>): void;
}
