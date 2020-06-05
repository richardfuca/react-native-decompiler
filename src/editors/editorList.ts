import { EditorConstructor } from './editor';
import VarSplitter from './variables/varSplitter';
import RequiresAtTop from './variables/requiresAtTop';
import CommaOperatorUnwrapper from './unwrappers/commaOperatorUnwrapper';
import EsModuleCleaner from './cleaners/esModuleCleaner';

const editorList: EditorConstructor[] = [
  VarSplitter,
  RequiresAtTop,
  CommaOperatorUnwrapper,
  EsModuleCleaner,
];

export default editorList;
