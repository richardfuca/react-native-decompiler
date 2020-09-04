import { performance } from 'perf_hooks';
import { NodePath } from '@babel/traverse';
import { PluginConstructor, Plugin } from './plugin';
import Module from './module';

export default class Router<T extends Plugin, TConstructor extends PluginConstructor<T>> {
  static traverseTimeTaken = 0;
  static timeTaken: { [index: string]: number } = {};

  private readonly module: Module;
  private readonly moduleList: Module[];
  private readonly list: T[];
  private readonly listConstructors: TConstructor[];
  private readonly maxPass: number;
  private readonly performance: boolean;

  constructor(list: TConstructor[], module: Module, moduleList: Module[], perfSetting: boolean) {
    this.listConstructors = list;
    this.list = list.map((PluginToLoad) => {
      if (perfSetting && Router.timeTaken[PluginToLoad.name] == null) {
        Router.timeTaken[PluginToLoad.name] = 0;
      }
      return new PluginToLoad(module, moduleList);
    });
    this.maxPass = Math.max(...this.list.map((plugin) => plugin.pass));
    this.performance = perfSetting;

    this.module = module;
    this.moduleList = moduleList;
  }

  parse = (module: Module): void => {
    for (let pass = 1; pass <= this.maxPass; pass += 1) {
      let startTime = performance.now();
      const visitorFunctions: { [index: string]: ((path: NodePath<unknown>) => void)[] } = {};
      this.list.forEach((plugin, i) => {
        if (plugin.pass !== pass) return;
        if (plugin.evaluate && this.performance) {
          startTime = performance.now();
          plugin.evaluate(module.path, this.rerunPlugin);
          Router.timeTaken[this.listConstructors[i].name] += performance.now() - startTime;
        } else if (plugin.evaluate) {
          plugin.evaluate(module.path, this.rerunPlugin);
        } else if (plugin.getVisitor) {
          /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
          const visitor: any = plugin.getVisitor(this.rerunPlugin);
          Object.keys(visitor).forEach((key) => {
            if (!visitorFunctions[key]) {
              visitorFunctions[key] = [];
            }
            if (this.performance) {
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
        module.path.traverse(visitor);
      }
      this.list.forEach((plugin, i) => {
        if (plugin.pass !== pass) return;
        if (plugin.afterPass && this.performance) {
          startTime = performance.now();
          plugin.afterPass(this.rerunPlugin);
          Router.timeTaken[this.listConstructors[i].name] += performance.now() - startTime;
        } else if (plugin.afterPass) {
          plugin.afterPass(this.rerunPlugin);
        }
      });
    }
  };

  processVisit = (plugins: ((path: NodePath<unknown>) => void)[]) => (path: NodePath<unknown>): void => {
    plugins.forEach((fn) => fn(path));
  };

  rerunPlugin = (PluginToRun: PluginConstructor): void => {
    const plugin = new PluginToRun(this.module, this.moduleList);
    if (plugin.evaluate) {
      plugin.evaluate(this.module.path, this.rerunPlugin);
    } else if (plugin.getVisitor) {
      this.module.path.traverse(plugin.getVisitor(this.rerunPlugin));
    } else {
      throw new Error('Plugin does not have getVisitor nor evaluate');
    }
  };
}
