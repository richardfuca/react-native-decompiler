import { PluginConstructor } from '../plugin';
import VoidZeroToUndefined from './longhanders/voidZeroToUndefined';
import LongBooleans from './longhanders/longBooleans';
import RequireMapper from './mappers/requireMapper';
import UselessCommaOperatorCleaner from './cleaners/uselessCommaOperatorCleaner';
import AssignmentIfElseToTernary from './cleaners/assignmentIfElseToTernary';
import HangingIfElseWrapper from './longhanders/hangingIfElseWrapper';
import DefaultInteropEvaluator from './evaluators/defaultInteropEvaluator';
import ArrayDestructureEvaluator from './evaluators/arrayDestructureEvaluator';
import SetStateRenamer from './react/setStateRenamer';
import ToConsumableArrayCleaner from './babel/cleaners/toConsumableArrayCleaner';
import Spreadifier from './evaluators/spreadifier';
import JSXConverter from './react/jsxConverter';

const decompilerList: PluginConstructor[] = [
  VoidZeroToUndefined,
  LongBooleans,
  RequireMapper,
  AssignmentIfElseToTernary,
  HangingIfElseWrapper,
  DefaultInteropEvaluator,
  ArrayDestructureEvaluator,
  Spreadifier,
  // pass 2
  ToConsumableArrayCleaner,
  UselessCommaOperatorCleaner,
  JSXConverter,
  // pass 3
  SetStateRenamer,
];

export default decompilerList;
