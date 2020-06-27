import crypto from 'crypto';
import fsExtra from 'fs-extra';
import Module from './module';
import CachedModule, { CachedFile } from './cacheModule';

export default class CacheParse {
  originalFile: string;
  cacheFile: string;

  constructor(originalFile: string, cacheFile: string) {
    this.originalFile = originalFile;
    this.cacheFile = cacheFile;
  }

  writeCache(file: string, moduleList: Module[]): void {
    fsExtra.writeJSONSync(file, <CachedFile>{
      checksum: crypto.createHash('md5').update(this.originalFile).digest('hex'),
      modules: moduleList.filter((ele) => ele != null).map((module): CachedModule => ({
        ignored: module.ignored,
        isNpmModule: module.isNpmModule,
        moduleId: module.moduleId,
        moduleName: module.moduleName,
        moduleStrings: module.moduleCodeStrings,
        npmModuleVarName: module.npmModuleVarName,
        originalCode: module.originalCode,
      })),
    });
  }
}
