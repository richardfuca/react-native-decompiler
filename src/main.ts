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

const argValues = commandLineArgs<{ in: string, out: string, entry: number }>([
  { name: 'in', alias: 'i' },
  { name: 'out', alias: 'o' },
  { name: 'entry', alias: 'e', type: Number },
]);

console.log('Reading file...');
const jsFile = fsExtra.readFileSync(argValues.in, 'utf8');
fsExtra.ensureDirSync(argValues.out);

console.log('Parsing JS...');
const originalFile = babylon.parse(jsFile);

console.log('Reading modules...');
const modules: Module[] = [];
traverse(originalFile, {
  // tslint:disable-next-line:function-name
  CallExpression(path) {
    if (path.node.callee.type === 'Identifier' && path.node.callee.name === '__d') {
      modules.push(new Module(path));
      path.skip();
    }
  },
});

console.log('Tagging...');
const progressBar = new CliProgress.SingleBar({ fps: 2, etaBuffer: 200 }, CliProgress.Presets.shades_classic);
progressBar.start(modules.length, 0);
modules.forEach((module) => {
  const router = new TaggerRouter(taggerList, module, modules);
  router.parse(module.path);

  progressBar.increment();
});

const nonIgnoredModules = modules.filter(module => !module.ignored);

progressBar.stop();
console.log('Decompiling...');
progressBar.start(nonIgnoredModules.length, 0);
nonIgnoredModules.forEach((module) => {
  const routers = {
    AssignmentExpression: new DecompilerRouter(assignmentExpressionDecompilersList, module, modules),
    CallExpression: new DecompilerRouter(callExpressionDecompilersList, module, modules),
    Identifier: new DecompilerRouter(identiferDecompilersList, module, modules),
  };
  module.path.traverse({
    AssignmentExpression: routers.AssignmentExpression.parse,
    CallExpression: routers.CallExpression.parse,
    Identifier: routers.Identifier.parse,
  });

  progressBar.increment();
});

progressBar.stop();
console.log('Generating code...');
progressBar.start(nonIgnoredModules.length, 0);
const generatedFiles = nonIgnoredModules.map(module => {
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
