import fs from 'fs-extra';
import * as babylon from '@babel/parser';
import traverse from '@babel/traverse';
import { isNumericLiteral, isFunctionExpression, isIdentifier } from '@babel/types';
import CmdArgs from '../interfaces/cmdArgs';
import Module from '../module';
import FileParser from './fileParser';
import PerformanceTracker from '../util/performanceTracker';
import ParamMappings from '../interfaces/paramMappings';

export default class WebpackSingleParser extends PerformanceTracker implements FileParser {
  private readonly PARAM_MAPPING: ParamMappings = {
    module: 0,
    exports: 1,
    require: 2,
  };

  async canParse(args: CmdArgs): Promise<boolean> {
    try {
      const file = await fs.readFile(args.in, 'utf8');

      return file.includes('window.webpackHotUpdate');
    } catch (e) {
      return false;
    }
  }

  async parse(args: CmdArgs): Promise<Module[]> {
    console.log('Parsing JS...');
    this.startTimer('parse-js');

    const file = await fs.readFile(args.in, 'utf8');
    const ast = babylon.parse(file);

    this.stopAndPrintTime('parse-js');

    const modules: Module[] = [];

    console.log('Finding modules...');
    this.startTimer('find-modules');

    traverse(ast, {
      CallExpression: (nodePath) => {
        const firstArg = nodePath.get('arguments')[0];
        if (isFunctionExpression(nodePath.node.callee) && firstArg?.isArrayExpression()) {
          firstArg.get('elements').forEach((element, i) => {
            if (!element.isFunctionExpression()) return;

            const dependencyValues: number[] = [];
            const requireIdentifer = element.node.params[2];
            if (!isIdentifier(requireIdentifer)) return;
            element.traverse({
              CallExpression: (dependencyPath) => {
                if (!isIdentifier(dependencyPath.node.callee) || !isNumericLiteral(dependencyPath.node.arguments[0])) return;
                if (dependencyPath.scope.bindingIdentifierEquals(dependencyPath.node.callee.name, requireIdentifer)) {
                  dependencyValues.push(dependencyPath.node.arguments[0].value);
                }
              },
            });

            const newModule = new Module(ast, element, i, dependencyValues, this.PARAM_MAPPING);
            newModule.calculateFields();
            modules[i] = newModule;
          });
        }
        nodePath.skip();
      },
    });

    this.stopAndPrintTime('find-modules');

    return modules;
  }
}
