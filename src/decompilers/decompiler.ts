import { NodePath } from '@babel/traverse';
import Module from '../module';
import { Node } from '@babel/types';

export interface DecompilerConstructor<T extends Node> {
  new(module: Module, moduleList: Module[]): Decompiler<T>;
}

export abstract class Decompiler<T extends Node> {
  protected readonly module: Module;
  protected readonly moduleList: Module[];

  constructor(module: Module, moduleList: Module[]) {
    this.module = module;
    this.moduleList = moduleList;
  }

  abstract actionable(path: NodePath<T>): boolean;

  abstract decompile(path: NodePath<T>): void;
}
