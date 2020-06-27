export interface CachedFile {
  checksum: string;
  modules: CachedModule[];
}

export default interface CachedModule {
  moduleId: number;
  originalCode: string;
  moduleStrings: string[];
  moduleName: string;
  npmModuleVarName?: string;
  isNpmModule: boolean;
  ignored: boolean;
}
