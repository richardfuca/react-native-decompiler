/**
  React Native Decompiler
  Copyright (C) 2020 Richard Fu and contributors

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { performance } from 'perf_hooks';
import { NodePath } from '@babel/traverse';
import { PluginConstructor, Plugin } from './plugin';
import Module from './module';
import CmdArgs from './interfaces/cmdArgs';

export default class Router<T extends Plugin, TConstructor extends PluginConstructor<T>> {
  static traverseTimeTaken = 0;
  static recrawlTimeTaken = 0;
  static timeTaken: { [index: string]: number } = {};

  private readonly module: Module;
  private readonly moduleList: Module[];
  private readonly list: T[];
  private readonly listConstructors: TConstructor[];
  private readonly maxPass: number;
  private readonly args: CmdArgs;

  constructor(list: TConstructor[], module: Module, moduleList: Module[], args: CmdArgs) {
    this.listConstructors = list;
    this.args = args;
    this.list = list.map((PluginToLoad) => {
      if (this.args.performance && Router.timeTaken[PluginToLoad.name] == null) {
        Router.timeTaken[PluginToLoad.name] = 0;
      }
      return new PluginToLoad(args, module, moduleList);
    });
    this.maxPass = Math.max(...this.list.map((plugin) => plugin.pass));

    this.module = module;
    this.moduleList = moduleList;
  }

  parse = (module: Module): void => {
    try {
      if (module.failedToDecompile) return;

      if (this.args.debug === module.moduleId) {
        let lastCode = '';
        this.list.forEach((plugin) => {
          if (plugin.evaluate) {
            plugin.evaluate(this.module.rootPath, this.runPlugin);
          } else if (plugin.getVisitor) {
            this.module.rootPath.traverse(plugin.getVisitor(this.runPlugin));
          } else {
            throw new Error('Plugin does not have getVisitor nor evaluate');
          }
          if (plugin.afterPass) {
            plugin.afterPass(this.runPlugin);
          }
          console.log('after', plugin.name ?? 'unknown_name:');
          const newCode = module.debugToCode();
          if (lastCode !== newCode) {
            console.log(newCode);
            lastCode = newCode;
          } else {
            console.log('No change');
          }
        });
        return;
      }

      for (let pass = 1; pass <= this.maxPass; pass += 1) {
        let startTime = performance.now();
        const visitorFunctions: { [index: string]: ((path: NodePath<unknown>) => void)[] } = {};
        this.list.forEach((plugin, i) => {
          if (plugin.pass !== pass) return;
          if (plugin.evaluate && this.args.performance) {
            startTime = performance.now();
            plugin.evaluate(module.rootPath, this.runPlugin);
            Router.timeTaken[this.listConstructors[i].name] += performance.now() - startTime;
          } else if (plugin.evaluate) {
            plugin.evaluate(module.rootPath, this.runPlugin);
          } else if (plugin.getVisitor) {
            /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
            const visitor: any = plugin.getVisitor(this.runPlugin);
            Object.keys(visitor).forEach((key) => {
              if (!visitorFunctions[key]) {
                visitorFunctions[key] = [];
              }
              if (this.args.performance) {
                visitorFunctions[key].push((path: NodePath<unknown>) => {
                  Router.traverseTimeTaken += performance.now() - startTime;
                  startTime = performance.now();
                  visitor[key](path);
                  Router.timeTaken[this.listConstructors[i].name] += performance.now() - startTime;
                  startTime = performance.now();
                });
              } else {
                visitorFunctions[key].push(visitor[key]);
              }
            });
          } else {
            throw new Error('Plugin does not have getVisitor nor evaluate');
          }
        });
        const visitor: any = {};
        Object.keys(visitorFunctions).forEach((key) => {
          visitor[key] = this.processVisit(visitorFunctions[key]);
        });
        /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
        if (Object.keys(visitor).length > 0) {
          startTime = performance.now();
          module.rootPath.traverse(visitor);
          Router.traverseTimeTaken += performance.now() - startTime;
        }
        this.list.forEach((plugin, i) => {
          if (plugin.pass !== pass) return;
          if (plugin.afterPass && this.args.performance) {
            startTime = performance.now();
            plugin.afterPass(this.runPlugin);
            Router.timeTaken[this.listConstructors[i].name] += performance.now() - startTime;
          } else if (plugin.afterPass) {
            plugin.afterPass(this.runPlugin);
          }
        });
      }
    } catch (e) {
      console.error(`An error occured parsing module ${module.moduleId}, it will be outputted as is!`);
      console.error(e);
      module.failedToDecompile = true;
    }
  };

  processVisit = (plugins: ((path: NodePath<unknown>) => void)[]) => (path: NodePath<unknown>): void => {
    plugins.forEach((fn) => fn(path));
  };

  runPlugin = (PluginToRun: PluginConstructor): void => {
    const plugin = new PluginToRun(this.args, this.module, this.moduleList);
    if (plugin.evaluate) {
      plugin.evaluate(this.module.rootPath, this.runPlugin);
    } else if (plugin.getVisitor) {
      this.module.rootPath.traverse(plugin.getVisitor(this.runPlugin));
    } else {
      throw new Error('Plugin does not have getVisitor nor evaluate');
    }
    if (plugin.afterPass) {
      plugin.afterPass(this.runPlugin);
    }
  };
}
