import { TaggerConstructor } from './tagger';
import PassthroughModuleRemapper from './remappers/passthroughModuleRemapper';
import SimpleModuleFinder from './npmModuleFinders/simpleModuleFinder';
import BabelModuleFinder from './npmModuleFinders/babelModuleFinder';

const taggerList: TaggerConstructor[] = [
  SimpleModuleFinder,
  PassthroughModuleRemapper,
  BabelModuleFinder,
];

export default taggerList;
