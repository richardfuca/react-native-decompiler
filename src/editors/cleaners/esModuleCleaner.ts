import { Editor } from '../editor';
import { CallExpression, isExpressionStatement, isCallExpression, isMemberExpression, isIdentifier, isStringLiteral } from '@babel/types';
import { NodePath } from '@babel/traverse';

export default class EsModuleCleaner extends Editor {
  evaluate(path: NodePath<CallExpression>): void {
    if (!this.module.tags.includes('__esModule')) return;

    path.traverse({
      BlockStatement: (path) => {
        path.node.body = path.node.body.filter((line) => {
          const callExpression = isExpressionStatement(line) ? line.expression : line;
          if (!isCallExpression(callExpression)) return true;
          if (!isMemberExpression(callExpression.callee)) return true;
          if (!isIdentifier(callExpression.callee.object) || !isIdentifier(callExpression.callee.property)) return true;
          if (callExpression.callee.object.name !== 'Object' || callExpression.callee.property.name !== 'defineProperty') return true;
          if (!isIdentifier(callExpression.arguments[0]) || !isStringLiteral(callExpression.arguments[1])) return true;
          if (path.scope.getBindingIdentifier(callExpression.arguments[0].name)?.start !== this.module.exportsParam.start) return true;
          if (callExpression.arguments[1].value !== '__esModule') return true;

          this.module.tags.push('__esModule');
          return false;
        });
        path.stop();
      },
    });
  }
}
