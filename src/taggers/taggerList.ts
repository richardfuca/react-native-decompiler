import PassthroughModuleRemapper from './remappers/passthroughModuleRemapper';
import SimpleModuleFinder from './npmModuleFinders/simpleModuleFinder';
import BabelModuleFinder from './npmModuleFinders/babelModuleFinder';
import { PluginConstructor } from '../plugin';

const taggerList: PluginConstructor[] = [
  SimpleModuleFinder,
  PassthroughModuleRemapper,
  BabelModuleFinder,
];

export default taggerList;
