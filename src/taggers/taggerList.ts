import { TaggerConstructor } from './tagger';
import ReactModuleFinder from './npmModuleFinders/reactModuleFInder';
import PassthroughModuleRemapper from './remappers/passthroughModuleRemapper';

const taggerList: TaggerConstructor[] = [
  ReactModuleFinder,
  PassthroughModuleRemapper,
];

export default taggerList;
