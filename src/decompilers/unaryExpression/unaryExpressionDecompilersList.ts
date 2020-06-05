import { DecompilerConstructor } from '../decompiler';
import { UnaryExpression } from '@babel/types';
import VoidZeroToUndefined from './voidZeroToUndefined';
import LongBooleans from './longBooleans';

const unaryExpressionDecompilersList: DecompilerConstructor<UnaryExpression>[] = [
  VoidZeroToUndefined,
  LongBooleans,
];

export default unaryExpressionDecompilersList;
