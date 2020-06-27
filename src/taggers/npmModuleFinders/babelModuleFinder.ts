import ModuleFinder from './moduleFinder';

export default class BabelModuleFinder extends ModuleFinder {
  evaluate(): void {
    if (!this.module.originalCode) throw new Error();

    if (this.module.moduleCodeStrings.includes('Cannot call a class as a function')) {
      this.tagAsNpmModule('@babel/runtime/helpers/classCallCheck');
      return;
    }

    const arraySpreadRegex = /{var .=.\(.\[0]\),.=.\(.\[1]\),.=.\(.\[2]\),.=.\(.\[3]\);.\.exports=function\(.\){return .\(.\)\|\|.\(.\)\|\|.\(.\)\|\|.\(\);};}/;
    if (arraySpreadRegex.test(this.module.originalCode)) {
      this.tagAsNpmModule('@babel/runtime/helpers/toConsumableArray');
      return;
    }

    const arrayDestructureRegex = /{var .=.\(.\[0]\),.=.\(.\[1]\),.=.\(.\[2]\),.=.\(.\[3]\);.\.exports=function\(.,.\){return .\(.\)\|\|.\(.,.\)\|\|.\(.,.\)\|\|.\(\);};}/;
    if (arrayDestructureRegex.test(this.module.originalCode)) {
      this.tagAsNpmModule('@babel/runtime/helpers/slicedToArray');
      return;
    }

    const requireDefaultRegex = /.\.exports=function\(.\){return .&&.\.__esModule\?.:{default:.};};/;
    if (requireDefaultRegex.test(this.module.originalCode)) {
      this.tagAsNpmModule('@babel/runtime/helpers/interopRequireDefault');
    }

    const interopWildcardRegex = /function .\(\){if\("function"!=typeof WeakMap\)return null;var .=new WeakMap\(\);return .=function\(\){return .;},.;}/;
    if (interopWildcardRegex.test(this.module.originalCode)) {
      this.tagAsNpmModule('@babel/runtime/helpers/interopRequireWildcard');
    }

    const createClassRegex = /.\.exports=function\(.,.,.\){return .&&.\(.\.prototype,.\),.&&.\(.,.\),.;};/;
    if (createClassRegex.test(this.module.originalCode)) {
      this.tagAsNpmModule('@babel/runtime/helpers/createClass');
    }
  }
}
