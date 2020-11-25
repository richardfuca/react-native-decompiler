/* eslint-disable max-len */
import ModuleFinder from './moduleFinder';

/**
 * Simple searcher of NPM modules through string matching
 */
export default class SimpleModuleFinder extends ModuleFinder {
  private readonly commentMappings: Record<string, string[]> = {
    react: ['react.production.min.js'],
    'react-dom': ['react-dom.production.min.js'],
    classnames: ['http://jedwatson.github.io/classnames'],
    'safe-buffer': ['safe-buffer. MIT License. Feross Aboukhadijeh'],
  };

  private readonly stringMappings: Record<string, string[]> = {
    react: ['https://reactjs.org/docs/error-decoder.html?invariant='],
    'react-dom': ['suspended while rendering, but no fallback UI was specified'],
    'react-native-web': ['Text strings must be rendered within a <Text> component.'],
    'base64-js': ['Invalid string. Length must be a multiple of 4'],
    'redux-react-hook': ['redux-react-hook requires your Redux store to be passed through context via the <StoreContext.Provider>'],
    'pusher-js': ['You must pass your app key when you instantiate Pusher.'],
    'regenerator-runtime': ['try statement without catch or finally'],
    '@sentry/browser': ['addGlobalEventProcessor', 'getHubFromCarrier'],
    'react-native': ['progress-bar-android-moved'],
    'url-parse': ['^[\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028\\u2029\\uFEFF]+'],
  };

  private readonly moduleVarNames: Record<string, string> = {
    react: 'React',
    'react-dom': 'ReactDOM',
    'base64-js': 'base64js',
    'pusher-js': 'Pusher',
    'regenerator-runtime': 'regeneratorRuntime',
    '@sentry/browser': 'Sentry',
    'react-native': 'ReactNative',
    'url-parse': 'Url',
    classnames: 'classnames',
    'safe-buffer': 'Buffer',
  };

  evaluate(): void {
    const commentMappingMatch = Object.keys(this.commentMappings).find((key) => this.test(this.module.moduleComments, this.commentMappings[key]));
    if (commentMappingMatch) {
      this.tagAsNpmModule(commentMappingMatch, this.moduleVarNames[commentMappingMatch]);
      return;
    }

    const stringMappingMatch = Object.keys(this.stringMappings).find((key) => this.test(this.module.moduleStrings, this.stringMappings[key]));
    if (stringMappingMatch) {
      this.tagAsNpmModule(stringMappingMatch, this.moduleVarNames[stringMappingMatch]);
    }
  }

  private test(moduleStrings: string[], stringsToFind: string[]): boolean {
    return stringsToFind.every((stringToFind) => moduleStrings.some((moduleString) => moduleString.includes(stringToFind)));
  }
}
