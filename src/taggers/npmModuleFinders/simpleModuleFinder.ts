/* eslint-disable max-len */
import ModuleFinder from './moduleFinder';

/**
 * Simple searcher of NPM modules through string matching
 */
export default class SimpleModuleFinder extends ModuleFinder {
  evaluate(): void {
    if (this.module.moduleStrings.includes('suspended while rendering, but no fallback UI was specified')) {
      this.tagAsNpmModule('react-dom');
    } else if (this.module.moduleStrings.includes('https://reactjs.org/docs/error-decoder.html?invariant=')) {
      this.tagAsNpmModule('react', 'React');
    } else if (this.module.moduleStrings.includes('Text strings must be rendered within a <Text> component.')) {
      this.tagAsNpmModule('react-native-web');
    } else if (this.module.moduleStrings.includes('Invalid string. Length must be a multiple of 4')) {
      this.tagAsNpmModule('base64-js', 'base64js');
    } else if (this.module.moduleStrings.includes('redux-react-hook requires your Redux store to be passed through context via the <StoreContext.Provider>')) {
      this.tagAsNpmModule('redux-react-hook');
    } else if (this.module.moduleStrings.includes('You must pass your app key when you instantiate Pusher.')) {
      this.tagAsNpmModule('pusher-js', 'Pusher');
    } else if (this.module.moduleStrings.includes('try statement without catch or finally')) {
      this.tagAsNpmModule('regenerator-runtime', 'regeneratorRuntime');
    } else if (this.module.moduleStrings.includes('addGlobalEventProcessor') && this.module.moduleStrings.includes('getHubFromCarrier')) {
      this.tagAsNpmModule('@sentry/browser', 'Sentry');
    } else if (this.module.moduleStrings.includes('progress-bar-android-moved')) {
      this.tagAsNpmModule('react-native', 'ReactNative');
    } else if (this.module.moduleStrings.includes('^[\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028\\u2029\\uFEFF]+')) {
      this.tagAsNpmModule('url-parse', 'Url');
    }
  }
}
