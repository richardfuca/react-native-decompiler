import { Plugin } from '../../plugin';

/**
 * Ignores files that are just CSS
 */
export default class StyleLoaderIgnorer extends Plugin {
  readonly pass = 2;

  evaluate(): void {
    const dependencies = this.module.dependencies.filter((e) => e != null);
    if (dependencies.length === 1 && this.moduleList[dependencies[0]]?.moduleName === 'style-loader') {
      this.module.ignored = true;
    }
  }
}
