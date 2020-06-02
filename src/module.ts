import { NodePath } from '@babel/traverse';
import generator from '@babel/generator';
import { CallExpression, Identifier, NumericLiteral, BlockStatement, File } from '@babel/types';

export default class Module {
  readonly path: NodePath<CallExpression>;
  readonly originalCode: string;
  readonly moduleCode: BlockStatement;
  readonly moduleCodeStrings: string[] = [];

  readonly moduleId: number;

  dependencies: number[];

  readonly globalsParam: Identifier;
  readonly requireParam: Identifier;
  readonly moduleObjParam: Identifier;
  readonly exportsParam: Identifier;
  readonly dependencyMapParam: Identifier;

  // modifiable fields
  /** The name of the module */
  moduleName: string;
  /** The variable to use if this is an NPM module */
  npmModuleVarName?: string;
  /** If this is a NPM module */
  isNpmModule: boolean = false;
  /** If the module should not be decompiled nor outputted */
  ignored: boolean = false;

  constructor(path: NodePath<CallExpression>, originalFile: File) {
    this.path = path;

    this.originalCode = generator({ ...originalFile.program, type: 'Program', body: [path.getStatementParent().node] }, { compact: true }).code;

    const moduleCode = path.node.arguments[0];
    if (moduleCode.type !== 'FunctionExpression') throw new SyntaxError(`Param 1 of __d should be a function but got ${moduleCode.type}`);
    this.moduleCode = moduleCode.body;

    const moduleIdNode = path.node.arguments[1];
    if (moduleIdNode.type !== 'NumericLiteral') throw new SyntaxError(`Param 2 of __d should be a number but got ${moduleIdNode.type}`);
    this.moduleId = moduleIdNode.value;
    this.moduleName = `${this.moduleId}`;

    const dependenciesNode = path.node.arguments[2];
    if (dependenciesNode.type !== 'ArrayExpression') throw new SyntaxError(`Param 3 of __d should be a array but got ${moduleIdNode.type}`);
    if (dependenciesNode.elements.some(node => node == null || node.type !== 'NumericLiteral')) throw new SyntaxError('Param 3 of __d has non-number elements');
    this.dependencies = (<NumericLiteral[]>dependenciesNode.elements).map(ele => ele.value);

    const moduleCodeParams = moduleCode.params;
    if (moduleCodeParams.length !== 5 && moduleCodeParams.length !== 7) throw new SyntaxError('Param 1 of __d doesnt have 5/7 params');
    if (moduleCodeParams.some(node => node == null || node.type !== 'Identifier')) throw new SyntaxError('Param 1 has some non-identifiers');
    this.globalsParam = <Identifier>moduleCodeParams[0];
    this.requireParam = <Identifier>moduleCodeParams[1];
    this.moduleObjParam = <Identifier>moduleCodeParams[moduleCodeParams.length === 7 ? 4 : 2];
    this.exportsParam = <Identifier>moduleCodeParams[moduleCodeParams.length === 7 ? 5 : 3];
    this.dependencyMapParam = <Identifier>moduleCodeParams[moduleCodeParams.length === 7 ? 6 : 4];

    this.path.traverse({
      StringLiteral: (path) => {
        this.moduleCodeStrings.push(path.node.value);
      },
    });
  }
}
