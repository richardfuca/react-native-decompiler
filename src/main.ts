import fsExtra from 'fs-extra';
import assert from 'assert';
import * as babylon from '@babel/parser';
import traverse from '@babel/traverse';
import generator from '@babel/generator';
import commandLineArgs from 'command-line-args';
// tslint:disable-next-line:import-name
import SyntaxVerifier from './syntaxVerifiers';
import { Identifier } from '@babel/types';

const argValues = commandLineArgs<{ in: string, out: string }>([
  { name: 'in', alias: 'i' },
  { name: 'out', alias: 'o' },
]);

console.log('Reading file...');
const jsFile = fsExtra.readFileSync(argValues.in, 'utf8');
fsExtra.ensureDirSync(argValues.out);
console.log('Parsing JS...');
const originalFile = babylon.parse(jsFile);
console.log('Decompiling...');
traverse(originalFile, {
  // tslint:disable-next-line:function-name
  CallExpression(path) {
    if (path.node.callee.type === 'Identifier' && path.node.callee.name === '__d') {
      const { dependenciesNums, moduleFunctionNode, moduleIdNode, moduleFunctionParams } = SyntaxVerifier.verifyValidModuleFunction(path.node);

      let globalsParam: Identifier | undefined;
      let requireParam: Identifier | undefined;
      let moduleObjectParam: Identifier | undefined;
      let exportsParam: Identifier | undefined;
      let dependencyMapParam: Identifier | undefined;
      if (moduleFunctionParams.length === 5) {
        globalsParam = moduleFunctionParams[0];
        requireParam = moduleFunctionParams[1];
        moduleObjectParam = moduleFunctionParams[2];
        exportsParam = moduleFunctionParams[3];
        dependencyMapParam = moduleFunctionParams[4];
      } else if (moduleFunctionParams.length === 7) {
        globalsParam = moduleFunctionParams[0];
        requireParam = moduleFunctionParams[1];
        moduleObjectParam = moduleFunctionParams[4];
        exportsParam = moduleFunctionParams[5];
        dependencyMapParam = moduleFunctionParams[6];
      } else {
        throw new Error('Unknown param lengths');
      }
      assert(globalsParam != null);
      assert(requireParam != null);
      assert(moduleObjectParam != null);
      assert(exportsParam != null);
      assert(dependencyMapParam != null);

      if (moduleIdNode.value !== 1704) {
        return;
      }
      path.traverse({
        Identifier(path) {
          if (!path.scope.bindings[path.node.name]) return;
          if (path.scope.bindings[path.node.name].identifier.start === globalsParam.start) {
            path.node.name = 'globals';
          }
        },
        AssignmentExpression(path) {
          if (!path.node.left || path.node.operator !== '=') return;
          if (path.node.left.type !== 'MemberExpression' || path.node.left.object.type !== 'Identifier') return;
          if (!path.scope.bindings[path.node.left.object.name]) return;
          if (path.scope.bindings[path.node.left.object.name].identifier.start === moduleObjectParam.start) {
            path.node.left.object.name = 'module';
          }
        },
        CallExpression(path) {
          if (path.node.callee.type === 'Identifier') {
            if (!path.scope.bindings[path.node.callee.name] ||
              path.scope.bindings[path.node.callee.name].identifier.start !== requireParam.start) return;
            path.node.callee.name = 'require';
            const { requiredModule } = SyntaxVerifier.verifyValidModuleRequire(path.node, dependencyMapParam.name);
            path.node.arguments[0] = babylon.parseExpression(`'./${dependenciesNums[requiredModule.value]}'`);
          } else if (path.node.callee.type === 'SequenceExpression') {
            if (path.node.callee.expressions.length !== 2) return;
            const firstPart = path.node.callee.expressions[0];
            if (firstPart.type !== 'NumericLiteral') return;
            path.node.callee = path.node.callee.expressions[1];
          }
        },
      });
      const code = generator({
        ...originalFile.program,
        type: 'Program',
        body: moduleFunctionNode.body.body,
      }).code;
      fsExtra.writeFileSync(`${argValues.out}/${moduleIdNode.value}.js`, code);
    }
  },
});
