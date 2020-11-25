import RequiresAtTop from './variables/requiresAtTop';
import CommaOperatorUnwrapper from './unwrappers/commaOperatorUnwrapper';
import EsModuleCleaner from './cleaners/esModuleCleaner';
import { PluginConstructor } from '../plugin';
import BabelInlineConverters from './converters/babelInlineConverters';

const editorList: PluginConstructor[] = [
  CommaOperatorUnwrapper,
  BabelInlineConverters,
  // pass 2
  RequiresAtTop,
  EsModuleCleaner,
];

export default editorList;
