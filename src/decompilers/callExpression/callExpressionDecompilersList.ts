import { DecompilerConstructor } from '../decompiler';
import { CallExpression } from '@babel/types';
import UselessCommaOperatorCleaner from './uselessCommaOperatorCleaner';
import RequireMapper from './requireMapper';

const callExpressionDecompilersList: DecompilerConstructor<CallExpression>[] = [
  UselessCommaOperatorCleaner,
  RequireMapper,
];

export default callExpressionDecompilersList;
