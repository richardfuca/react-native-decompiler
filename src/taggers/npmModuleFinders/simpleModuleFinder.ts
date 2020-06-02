import ModuleFinder from './moduleFinder';

export default class SimpleModuleFinder extends ModuleFinder {
  evaluate(): void {
    if (this.module.moduleCodeStrings.includes('suspended while rendering, but no fallback UI was specified')) {
      this.tagAsNpmModule('react-dom');
    } else if (this.module.moduleCodeStrings.includes('https://reactjs.org/docs/error-decoder.html?invariant=')) {
      this.tagAsNpmModule('react', 'React');
    } else if (this.module.moduleCodeStrings.includes('Invalid string. Length must be a multiple of 4')) {
      this.tagAsNpmModule('base64-js', 'base64js');
    }
  }
}
