import { NodePath } from '@babel/traverse';
import generator from '@babel/generator';
import {
  Identifier, BlockStatement, File, FunctionExpression, expressionStatement,
} from '@babel/types';
import ParamMappings from './interfaces/paramMappings';
import { CachedModule } from './interfaces/cachedFile';

export default class Module {
  /** The original file that held this module */
  originalFile: File;
  /** The root path describing the function enclosing the module in the original file */
  rootPath: NodePath<FunctionExpression>;
  /** The module code */
  moduleCode: BlockStatement;
  /** The ID of the module */
  moduleId: number;
  /** The dependencies of this module */
  dependencies: number[];
  /** The param mapping used */
  private paramMappings: ParamMappings;

  /** The module's global variable */
  globalsParam?: Identifier;
  /** The module's require variable */
  requireParam?: Identifier;
  /** The module's module variable */
  moduleParam?: Identifier;
  /** The module's exports variable */
  exportsParam?: Identifier;

  originalCode = '';
  moduleStrings: string[] = [];

  // modifiable fields
  /** The name of the module */
  moduleName: string;
  /** The variable to use if this is an NPM module */
  npmModuleVarName?: string;
  /** If this is a NPM module */
  isNpmModule = false;
  /** If the module should not be decompiled nor outputted */
  ignored = false;
  /** If the module failed to decompile */
  failedToDecompile = false;
  /** The module tags */
  tags: string[] = [];

  constructor(originalFile: File, rootPath: NodePath<FunctionExpression>, moduleId: number, dependencies: number[], paramMappings: ParamMappings) {
    this.originalFile = originalFile;
    this.rootPath = rootPath;
    this.moduleId = moduleId;
    this.dependencies = dependencies;
    this.paramMappings = paramMappings;

    this.moduleCode = rootPath.node.body;
    this.moduleName = this.moduleId.toString();

    this.globalsParam = this.getFunctionParam(paramMappings.globals);
    this.requireParam = this.getFunctionParam(paramMappings.require);
    this.moduleParam = this.getFunctionParam(paramMappings.module);
    this.exportsParam = this.getFunctionParam(paramMappings.exports);
  }

  private getFunctionParam(index?: number): Identifier | undefined {
    if (index == null) return undefined;
    const param = this.rootPath.get('params')[index];
    if (!param.isIdentifier()) throw new Error('Function param not Identifier');
    return param.node;
  }

  calculateFields(): void {
    this.originalCode = generator({
      ...this.originalFile.program,
      type: 'Program',
      body: [expressionStatement(this.rootPath.node)],
    }, { compact: true }).code;

    this.rootPath.traverse({
      StringLiteral: (path) => {
        this.moduleStrings.push(path.node.value);
      },
    });
  }

  validate(): void {
    if (!this.originalCode) throw new Error('Original code is required');
    if (!this.moduleStrings) throw new Error('Module strings is required');
  }

  unpack(): void {
    if (this.globalsParam?.name) {
      this.rootPath.scope.rename(this.globalsParam?.name, 'globals');
    }
    if (this.requireParam?.name) {
      this.rootPath.scope.rename(this.requireParam?.name, 'require');
    }
    if (this.moduleParam?.name) {
      this.rootPath.scope.rename(this.moduleParam?.name, 'module');
    }
    if (this.exportsParam?.name) {
      this.rootPath.scope.rename(this.exportsParam?.name, 'exports');
    }
  }

  toCache(): CachedModule {
    return {
      code: this.originalCode,
      dependencies: this.dependencies,
      ignored: this.ignored,
      isNpmModule: this.isNpmModule,
      moduleId: this.moduleId,
      moduleName: this.moduleName,
      moduleStrings: this.moduleStrings,
      paramMappings: this.paramMappings,
      npmModuleVarName: this.npmModuleVarName,
    };
  }
}
