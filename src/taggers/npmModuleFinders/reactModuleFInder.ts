import { Tagger } from '../tagger';
import { NodePath } from '@babel/traverse';
import { CallExpression } from '@babel/types';

export default class ReactModuleFinder extends Tagger {
  evaluate(path: NodePath<CallExpression>): void {
    let isReact = false;
    let isReactDom = false;
    path.traverse({
      StringLiteral: (path) => {
        if (path.node.value.includes('https://reactjs.org/docs/error-decoder.html?invariant')) {
          isReact = true;

        }
        if (path.node.value.includes('suspended while rendering, but no fallback UI was specified')) {
          isReactDom = true;
        }
        path.stop();
      },
    });

    if (isReact) {
      this.module.isNpmModule = true;
      this.module.ignored = true;
      this.module.moduleName = isReactDom ? 'react-dom' : 'react';

      const reactModules = new Set(this.module.dependencies);
      let lastLength = 0;
      while (lastLength !== reactModules.size) {
        lastLength = reactModules.size;
        reactModules.forEach((i) => {
          this.moduleList[i].dependencies.forEach(dep => reactModules.add(dep));
        });
      }

      reactModules.forEach((i) => {
        this.moduleList[i].ignored = true;
      });
    }
  }
}
