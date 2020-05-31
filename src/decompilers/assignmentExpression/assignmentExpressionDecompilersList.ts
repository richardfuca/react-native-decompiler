import { DecompilerConstructor } from '../decompiler';
import { AssignmentExpression } from '@babel/types';
import ModuleRenamer from './moduleRenamer';
import ExportRenamer from './exportRenamer';

const assignmentExpressionDecompilersList: DecompilerConstructor<AssignmentExpression>[] = [
  ExportRenamer,
  ModuleRenamer,
];

export default assignmentExpressionDecompilersList;
