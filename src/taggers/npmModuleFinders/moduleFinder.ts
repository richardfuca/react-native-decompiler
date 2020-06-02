import { Tagger } from '../tagger';
import { NodePath } from '@babel/traverse';
import { CallExpression } from '@babel/types';

export default abstract class ModuleFinder extends Tagger {
  protected tagAsNpmModule(moduleName: string, varName?: string) {
    if (this.module.isNpmModule) {
      throw new Error(`Module #${this.module.moduleId} is already the ${this.module.moduleName} module but tried to re-tag as ${moduleName}`);
    }

    this.module.isNpmModule = true;
    this.module.ignored = true;
    this.module.moduleName = moduleName;
    this.module.npmModuleVarName = varName;

    const modules = new Set(this.module.dependencies);
    let lastLength = 0;
    while (lastLength !== modules.size) {
      lastLength = modules.size;
      modules.forEach((i) => {
        this.moduleList[i].dependencies.forEach(dep => modules.add(dep));
      });
    }

    modules.forEach((i) => {
      this.moduleList[i].ignored = true;
    });
  }

  abstract evaluate(path: NodePath<CallExpression>): void;
}
