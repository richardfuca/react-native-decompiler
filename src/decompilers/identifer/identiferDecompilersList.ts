import { DecompilerConstructor } from '../decompiler';
import { Identifier } from '@babel/types';
import GlobalsRenamer from './globalsRenamer';
import ExportsRenamer from './exportsRenamer';
import ModulesRenamer from './modulesRenamer';

const identiferDecompilersList: DecompilerConstructor<Identifier>[] = [
  GlobalsRenamer,
  ExportsRenamer,
  ModulesRenamer,
];

export default identiferDecompilersList;
