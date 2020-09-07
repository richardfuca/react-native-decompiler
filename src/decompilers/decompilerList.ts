import { PluginConstructor } from '../plugin';
import VoidZeroToUndefined from './longhanders/voidZeroToUndefined';
import LongBooleans from './longhanders/longBooleans';
import WebpackRenamer from './renamers/webpackRenamer';
import RequireMapper from './mappers/requireMapper';
import UselessCommaOperatorCleaner from './cleaners/uselessCommaOperatorCleaner';
import AssignmentIfElseToTernary from './cleaners/assignmentIfElseToTernary';
import HangingIfElseWrapper from './longhanders/hangingIfElseWrapper';
import DefaultInteropEvaluator from './evaluators/defaultInteropEvaluator';
import ArrayDestructureEvaluator from './evaluators/arrayDestructureEvaluator';
import SetStateRenamer from './react/renamers/setStateRenamer';
import ToConsumableArrayCleaner from './babel/cleaners/toConsumableArrayCleaner';
import Spreadifier from './evaluators/spreadifier';

const decompilerList: PluginConstructor[] = [
  VoidZeroToUndefined,
  LongBooleans,
  WebpackRenamer,
  RequireMapper,
  AssignmentIfElseToTernary,
  HangingIfElseWrapper,
  DefaultInteropEvaluator,
  ArrayDestructureEvaluator,
  Spreadifier,
  // pass 2
  ToConsumableArrayCleaner,
  UselessCommaOperatorCleaner,
  // pass 3
  SetStateRenamer,
];

export default decompilerList;
