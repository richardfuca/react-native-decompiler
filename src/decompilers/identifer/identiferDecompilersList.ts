import { DecompilerConstructor } from '../decompiler';
import { Identifier } from '@babel/types';
import GlobalsRenamer from './globalsRenamer';

const identiferDecompilersList: DecompilerConstructor<Identifier>[] = [
  GlobalsRenamer,
];

export default identiferDecompilersList;
