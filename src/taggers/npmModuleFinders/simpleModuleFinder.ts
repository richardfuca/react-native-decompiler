import ModuleFinder from './moduleFinder';

export default class SimpleModuleFinder extends ModuleFinder {
  evaluate(): void {
    if (this.module.moduleCodeStrings.includes('suspended while rendering, but no fallback UI was specified')) {
      this.tagAsNpmModule('react-dom');
    } else if (this.module.moduleCodeStrings.includes('https://reactjs.org/docs/error-decoder.html?invariant=')) {
      this.tagAsNpmModule('react', 'React');
    } else if (this.module.moduleCodeStrings.includes('Text strings must be rendered within a <Text> component.')) {
      this.tagAsNpmModule('react-native-web');
    } else if (this.module.moduleCodeStrings.includes('Invalid string. Length must be a multiple of 4')) {
      this.tagAsNpmModule('base64-js', 'base64js');
    } else if (this.module.moduleCodeStrings.includes('redux-react-hook requires your Redux store to be passed through context via the <StoreContext.Provider>')) {
      this.tagAsNpmModule('redux-react-hook');
    } else if (this.module.moduleCodeStrings.includes('You must pass your app key when you instantiate Pusher.')) {
      this.tagAsNpmModule('pusher-js', 'Pusher');
    } else if (this.module.moduleCodeStrings.includes('try statement without catch or finally')) {
      this.tagAsNpmModule('regenerator-runtime', 'regeneratorRuntime');
    } else if (this.module.moduleCodeStrings.includes('addGlobalEventProcessor') && this.module.moduleCodeStrings.includes('getHubFromCarrier')) {
      this.tagAsNpmModule('@sentry/browser', 'Sentry');
    } else if (this.module.moduleCodeStrings.includes('progress-bar-android-moved')) {
      this.tagAsNpmModule('react-native', 'ReactNative');
    }
  }
}
