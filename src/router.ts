import { performance } from 'perf_hooks';
import { PluginConstructor, Plugin } from './plugin';
import Module from './module';
import { NodePath } from '@babel/traverse';

export default class Router<T extends Plugin, TConstructor extends PluginConstructor<T>> {
  static traverseTimeTaken = 0;
  static timeTaken: { [index: string]: number } = {};

  private readonly list: T[];
  private readonly listConstructors: TConstructor[];
  private readonly maxPass: number;
  private readonly performance: boolean;

  constructor(list: TConstructor[], module: Module, moduleList: Module[], perfSetting: boolean) {
    this.listConstructors = list;
    this.list = list.map((plugin) => {
      if (perfSetting && Router.timeTaken[plugin.name] == null) {
        Router.timeTaken[plugin.name] = 0;
      }
      return new plugin(module, moduleList);
    });
    this.maxPass = Math.max(...this.list.map(plugin => plugin.pass));
    this.performance = perfSetting;
  }

  parse = (module: Module) => {
    let startTime = performance.now();
    for (let pass = 1; pass <= this.maxPass; pass += 1) {
      const visitorFunctions: { [index: string]: ((path: NodePath<unknown>) => void)[] } = {};
      this.list.forEach((plugin, i) => {
        if (plugin.pass !== pass) return;
        if (plugin.evaluate && this.performance) {
          startTime = performance.now();
          plugin.evaluate(module.path);
          Router.timeTaken[this.listConstructors[i].name] += performance.now() - startTime;
        } else if (plugin.evaluate) {
          plugin.evaluate(module.path);
        } else if (plugin.getVisitor) {
          const visitor: any = plugin.getVisitor();
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
      if (Object.keys(visitor).length > 0) {
        startTime = performance.now();
        module.path.traverse(visitor);
      }
    }
  }

  processVisit = (plugins: ((path: NodePath<unknown>) => void)[]) => (path: NodePath<unknown>) => {
    plugins.forEach(fn => fn(path));
  }
}
