import fsExtra from 'fs-extra';
import * as babylon from '@babel/parser';
import traverse from '@babel/traverse';
import generator from '@babel/generator';
import commandLineArgs from 'command-line-args';
import Module from './module';
import DecompilerRouter from './decompilers/decompilerRouter';
import taggerList from './taggers/taggerList';
import TaggerRouter from './taggers/taggerRouter';
import assignmentExpressionDecompilersList from './decompilers/assignmentExpression/assignmentExpressionDecompilersList';
import callExpressionDecompilersList from './decompilers/callExpression/callExpressionDecompilersList';
import identiferDecompilersList from './decompilers/identifer/identiferDecompilersList';
import CliProgress from 'cli-progress';
import crypto from 'crypto';
import EditorRouter from './editors/editorRouter';
import editorList from './editors/editorList';
import unaryExpressionDecompilersList from './decompilers/unaryExpression/unaryExpressionDecompilersList';

const argValues = commandLineArgs<{ in: string, out: string, entry: number }>([
  { name: 'in', alias: 'i' },
  { name: 'out', alias: 'o' },
  { name: 'entry', alias: 'e', type: Number },
]);

fsExtra.ensureDirSync(argValues.out);

console.log('Reading file...');
let jsFile = fsExtra.readFileSync(argValues.in, 'utf8');
if (argValues.entry && fsExtra.existsSync(`${argValues.out}/${argValues.entry}.cache`)) {
  const cacheFile = fsExtra.readFileSync(`${argValues.out}/${argValues.entry}.cache`, 'utf8');
  if (cacheFile.split('\n')[0] !== crypto.createHash('md5').update(jsFile).digest('hex')) {
    console.log('Cache invalidated due to checksum mismatch');
    fsExtra.removeSync(`${argValues.out}/${argValues.entry}.cache`);
  } else {
    console.log('Reading from cache!');
    jsFile = cacheFile.split('\n').slice(1).join('\n');
  }
}

console.log('Parsing JS...');
const originalFile = babylon.parse(jsFile);

console.log('Reading modules...');
const modules: Module[] = [];
traverse(originalFile, {
  // tslint:disable-next-line:function-name
  CallExpression(path) {
    if (path.node.callee.type === 'Identifier' && path.node.callee.name === '__d') {
      const module = new Module(path, originalFile);
      modules[module.moduleId] = module;
      path.skip();
    }
  },
});

let modulesToTag = modules;
if (argValues.entry != null) {
  const entryModuleDependencies: Set<number> = new Set();
  let lastDependenciesSize = 0;

  entryModuleDependencies.add(argValues.entry);

  while (lastDependenciesSize !== entryModuleDependencies.size) {
    lastDependenciesSize = entryModuleDependencies.size;
    entryModuleDependencies.forEach((moduleId) => {
      const module = modules.find(module => module?.moduleId === moduleId);
      if (!module) throw new Error(`Failed to find entry module/dependency ${moduleId}`);
      module.dependencies.forEach(dep => entryModuleDependencies.add(dep));
    });
  }

  modulesToTag = modules.filter(module => entryModuleDependencies.has(module.moduleId));

  if (!fsExtra.existsSync(`${argValues.out}/${argValues.entry}.cache`)) {
    const cacheLines = [
      crypto.createHash('md5').update(jsFile).digest('hex'),
      ...modules.map(module => module.originalCode),
    ];
    fsExtra.writeFileSync(`${argValues.out}/${argValues.entry}.cache`, cacheLines.join('\n'));
  }
}

console.log('Tagging...');
const progressBar = new CliProgress.SingleBar({ etaBuffer: 200 }, CliProgress.Presets.shades_classic);
progressBar.start(modulesToTag.length, 0);
modulesToTag.forEach((module) => {
  const router = new TaggerRouter(taggerList, module, modules);
  router.parse(module.path);

  progressBar.increment();
});

const nonIgnoredModules = modulesToTag.filter(module => !module.ignored);

progressBar.stop();
console.log('Decompiling...');
progressBar.start(nonIgnoredModules.length, 0);
nonIgnoredModules.forEach((module) => {
  const editorRouter = new EditorRouter(editorList, module, modules);
  editorRouter.parse(module.path);

  const decompilerRouters = {
    AssignmentExpression: new DecompilerRouter(assignmentExpressionDecompilersList, module, modules),
    CallExpression: new DecompilerRouter(callExpressionDecompilersList, module, modules),
    Identifier: new DecompilerRouter(identiferDecompilersList, module, modules),
    UnaryExpression: new DecompilerRouter(unaryExpressionDecompilersList, module, modules),
  };
  module.path.traverse({
    AssignmentExpression: decompilerRouters.AssignmentExpression.parse,
    CallExpression: decompilerRouters.CallExpression.parse,
    Identifier: decompilerRouters.Identifier.parse,
    UnaryExpression: decompilerRouters.UnaryExpression.parse,
  });

  progressBar.increment();
});

progressBar.stop();
console.log('Generating code...');
progressBar.start(nonIgnoredModules.length, 0);
const generatedFiles = nonIgnoredModules.map((module) => {
  const returnValue = {
    name: module.moduleName,
    code: generator({
      ...originalFile.program,
      type: 'Program',
      body: module.moduleCode.body,
    }).code,
  };
  progressBar.increment();
  return returnValue;
});

progressBar.stop();
console.log('Saving...');
progressBar.start(nonIgnoredModules.length, 0);
generatedFiles.map((file) => {
  const filePath = `${argValues.out}/${file.name}.js`;
  if (!fsExtra.existsSync(filePath) || fsExtra.readFileSync(filePath, 'utf-8') !== file.code) {
    fsExtra.writeFileSync(`${argValues.out}/${file.name}.js`, file.code);
  }
  progressBar.increment();
});

progressBar.stop();
console.log('Done!');
