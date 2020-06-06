import VarSplitter from './variables/varSplitter';
import RequiresAtTop from './variables/requiresAtTop';
import CommaOperatorUnwrapper from './unwrappers/commaOperatorUnwrapper';
import EsModuleCleaner from './cleaners/esModuleCleaner';
import { PluginConstructor } from '../plugin';

const editorList: PluginConstructor[] = [
  VarSplitter,
  CommaOperatorUnwrapper,
  RequiresAtTop,
  EsModuleCleaner,
];

export default editorList;
