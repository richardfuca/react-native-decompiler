import RequiresAtTop from './variables/requiresAtTop';
import CommaOperatorUnwrapper from './unwrappers/commaOperatorUnwrapper';
import EsModuleCleaner from './cleaners/esModuleCleaner';
import { PluginConstructor } from '../plugin';

const editorList: PluginConstructor[] = [
  // VarSplitter,
  CommaOperatorUnwrapper,
  // pass 2
  RequiresAtTop,
  EsModuleCleaner,
];

export default editorList;
