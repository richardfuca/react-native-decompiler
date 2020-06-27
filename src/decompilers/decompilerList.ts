import { PluginConstructor } from '../plugin';
import VoidZeroToUndefined from './longhanders/voidZeroToUndefined';
import LongBooleans from './longhanders/longBooleans';
import WebpackRenamer from './renamers/webpackRenamer';
import RequireMapper from './mappers/requireMapper';
import UselessCommaOperatorCleaner from './cleaners/uselessCommaOperatorCleaner';
import TypeofFlipper from './flippers/typeofFlipper';
import AssignmentIfElseToTernary from './cleaners/assignmentIfElseToTernary';
import HangingIfElseWrapper from './longhanders/hangingIfElseWrapper';
import DefaultInteropEvaluator from './evaluators/defaultInteropEvaluator';
import ArrayDestructureEvaluator from './evaluators/arrayDestructureEvaluator';

const decompilerList: PluginConstructor[] = [
  VoidZeroToUndefined,
  LongBooleans,
  WebpackRenamer,
  RequireMapper,
  TypeofFlipper,
  AssignmentIfElseToTernary,
  HangingIfElseWrapper,
  DefaultInteropEvaluator,
  ArrayDestructureEvaluator,
  // pass 2
  UselessCommaOperatorCleaner,
];

export default decompilerList;
