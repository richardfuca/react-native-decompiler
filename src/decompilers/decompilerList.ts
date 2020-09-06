import { PluginConstructor } from '../plugin';
import VoidZeroToUndefined from './longhanders/voidZeroToUndefined';
import LongBooleans from './longhanders/longBooleans';
import WebpackRenamer from './renamers/webpackRenamer';
import RequireMapper from './mappers/requireMapper';
import UselessCommaOperatorCleaner from './cleaners/uselessCommaOperatorCleaner';
import ConditionFlipper from './flippers/conditionFlipper';
import AssignmentIfElseToTernary from './cleaners/assignmentIfElseToTernary';
import HangingIfElseWrapper from './longhanders/hangingIfElseWrapper';
import DefaultInteropEvaluator from './evaluators/defaultInteropEvaluator';
import ArrayDestructureEvaluator from './evaluators/arrayDestructureEvaluator';
import SetStateRenamer from './react/renamers/setStateRenamer';

const decompilerList: PluginConstructor[] = [
  VoidZeroToUndefined,
  LongBooleans,
  WebpackRenamer,
  RequireMapper,
  AssignmentIfElseToTernary,
  HangingIfElseWrapper,
  DefaultInteropEvaluator,
  ArrayDestructureEvaluator,
  // pass 2
  ConditionFlipper,
  UselessCommaOperatorCleaner,
  // pass 3
  SetStateRenamer,
];

export default decompilerList;
