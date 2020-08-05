import { NodePath } from '@babel/traverse';
import generator from '@babel/generator';
import {
  CallExpression, Identifier, NumericLiteral, BlockStatement, File, isFunctionExpression, isNumericLiteral, isArrayExpression, isIdentifier,
} from '@babel/types';
import CachedModule from './cacheModule';

export default class Module {
  path: NodePath<CallExpression>;
  originalFile: File;

  moduleCode: BlockStatement;
  moduleId: number;
  /** The dependencies of this module */
  dependencies: number[];
  globalsParam: Identifier;
  requireParam: Identifier;
  moduleObjParam: Identifier;
  exportsParam: Identifier;
  dependencyMapParam: Identifier;

  cacheLoaded = false;
  originalCode!: string;
  moduleCodeStrings: string[] = [];

  // modifiable fields
  /** The name of the module */
  moduleName: string;
  /** The variable to use if this is an NPM module */
  npmModuleVarName?: string;
  /** If this is a NPM module */
  isNpmModule = false;
  /** If the module should not be decompiled nor outputted */
  ignored = false;
  /** The module tags */
  tags: string[] = [];

  constructor(path: NodePath<CallExpression>, originalFile: File) {
    this.path = path;
    this.originalFile = originalFile;

    const moduleCodeFunction = path.node.arguments[0];
    if (!isFunctionExpression(moduleCodeFunction)) throw new SyntaxError('Param 1 of __d ws not a function');
    this.moduleCode = moduleCodeFunction.body;

    if (!isNumericLiteral(path.node.arguments[1])) throw new SyntaxError('Param 2 of __d not a number');
    this.moduleId = path.node.arguments[1].value;
    this.moduleName = `${this.moduleId}`;

    if (!isArrayExpression(path.node.arguments[2])) throw new SyntaxError('Param 3 of __d not a array');
    if (path.node.arguments[2].elements.some((node) => !isNumericLiteral(node))) throw new SyntaxError('Param 3 of __d has non-number elements');
    this.dependencies = (<NumericLiteral[]>path.node.arguments[2].elements).map((ele) => ele.value);

    if (moduleCodeFunction.params.length !== 5 && moduleCodeFunction.params.length !== 7) throw new SyntaxError('Param 1 of __d doesnt have 5/7 params');
    if (moduleCodeFunction.params.some((node) => !isIdentifier(node))) throw new SyntaxError('Param 1 has some non-identifiers');
    this.globalsParam = <Identifier>moduleCodeFunction.params[0];
    this.requireParam = <Identifier>moduleCodeFunction.params[1];
    this.moduleObjParam = <Identifier>moduleCodeFunction.params[moduleCodeFunction.params.length === 7 ? 4 : 2];
    this.exportsParam = <Identifier>moduleCodeFunction.params[moduleCodeFunction.params.length === 7 ? 5 : 3];
    this.dependencyMapParam = <Identifier>moduleCodeFunction.params[moduleCodeFunction.params.length === 7 ? 6 : 4];
  }

  loadCache(cache: CachedModule): void {
    this.cacheLoaded = true;
    this.originalCode = cache.originalCode;
    this.moduleCodeStrings = cache.moduleStrings ?? [];
    this.moduleName = cache.moduleName;
    this.npmModuleVarName = cache.npmModuleVarName;
  }

  initalize(): void {
    this.originalCode = this.originalCode ?? generator({
      ...this.originalFile.program,
      type: 'Program',
      body: [this.path.getStatementParent().node],
    }, { compact: true }).code;

    if (!this.cacheLoaded) {
      this.path.traverse({
        StringLiteral: (path) => {
          this.moduleCodeStrings.push(path.node.value);
        },
      });
    }
  }
}
