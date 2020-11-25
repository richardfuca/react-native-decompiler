import ParamMappings from './paramMappings';

export interface CachedFile {
  checksum: string[];
  modules: CachedModule[];
}

export interface CachedModule {
  code: string;
  moduleId: number;
  dependencies: number[];
  moduleStrings: string[];
  moduleComments: string[];
  moduleName: string;
  npmModuleVarName?: string;
  isNpmModule: boolean;
  ignored: boolean;
  paramMappings: ParamMappings;
}
