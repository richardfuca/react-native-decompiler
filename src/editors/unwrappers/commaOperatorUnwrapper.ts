import { isSequenceExpression, isBlockStatement, expressionStatement } from '@babel/types';
import { Visitor } from '@babel/traverse';
import { Plugin } from '../../plugin';

/**
 * Seperates statements wrapped in comma operations `(a, b)` into seperate lines
 */
export default class CommaOperatorUnwrapper extends Plugin {
  readonly pass = 1;
  readonly name = 'CommaOperatorUnwrapper';

  getVisitor(): Visitor {
    return {
      ReturnStatement: (path) => {
        if (!isSequenceExpression(path.node.argument) || !isBlockStatement(path.parent)) return;
        if (path.node.argument.expressions.length <= 1) return;

        this.debugLog('unwrap ReturnStatement');
        this.debugLog(this.debugPathToCode(path));
        this.debugLog('---');

        path.parent.body.splice(path.parent.body.findIndex((ste) => ste === path.node), 0, ...path.node.argument.expressions.slice(0, -1).map((exp) => expressionStatement(exp)));
        path.node.argument = path.node.argument.expressions[path.node.argument.expressions.length - 1];
      },
      VariableDeclaration: (path) => {
        if (!isBlockStatement(path.parent)) return;
        path.node.declarations.forEach((declarator) => {
          if (!isBlockStatement(path.parent)) return;
          if (!isSequenceExpression(declarator.init)) return;

          this.debugLog('unwrap VariableDeclaration');
          this.debugLog(this.debugPathToCode(path));
          this.debugLog('---');

          path.parent.body.splice(path.parent.body.findIndex((ste) => ste === path.node), 0, ...declarator.init.expressions.slice(0, -1).map((exp) => expressionStatement(exp)));
          declarator.init = declarator.init.expressions[declarator.init.expressions.length - 1];
        });
      },
      ExpressionStatement: (path) => {
        if (!isSequenceExpression(path.node.expression) || !isBlockStatement(path.parent)) return;
        if (path.node.expression.expressions.length <= 1) return;

        this.debugLog('unwrap ExpressionStatement');
        this.debugLog(this.debugPathToCode(path));
        this.debugLog('---');

        path.replaceWithMultiple(path.node.expression.expressions);
      },
    };
  }
}
