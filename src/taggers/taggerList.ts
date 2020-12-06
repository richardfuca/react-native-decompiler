import PassthroughModuleRemapper from './remappers/passthroughModuleRemapper';
import SimpleModuleFinder from './npmModuleFinders/simpleModuleFinder';
import BabelModuleFinder from './npmModuleFinders/babelModuleFinder';
import { PluginConstructor } from '../plugin';
import StyleLoaderIgnorer from './webpack/styleLoaderIgnorer';
import EmptyIgnorer from './vanilla/emptyIgnorer';

const taggerList: PluginConstructor[] = [
  // pass 1
  EmptyIgnorer,
  SimpleModuleFinder,
  BabelModuleFinder,
  // pass 2
  PassthroughModuleRemapper,
  StyleLoaderIgnorer,
];

export default taggerList;
