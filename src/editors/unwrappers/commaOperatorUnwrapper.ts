import { Identifier, isIdentifier } from '@babel/types';
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
        const argument = path.get('argument');
        if (!argument.isSequenceExpression() || argument.get('expressions').length <= 1) return;
        const expressions = argument.get('expressions');

        this.debugLog('unwrap ReturnStatement');
        this.debugLog(this.debugPathToCode(path));
        this.debugLog('---');

        path.insertBefore(expressions.splice(0, -1).map((exp) => exp.node));
        for (let i = 0; i < expressions.length - 1; i += 1) {
          expressions[i].remove();
        }
        path.get('argument').replaceWith(expressions[expressions.length - 1]);
      },
      VariableDeclaration: (path) => {
        const declarations = path.get('declarations');
        declarations.forEach((declarator) => {
          const init = declarator.get('init');
          if (!init.isSequenceExpression()) return;

          this.debugLog('unwrap VariableDeclaration');
          this.debugLog(this.debugPathToCode(path));
          this.debugLog('---');

          const validExpressions = init.get('expressions').filter((expression) => {
            if (!expression.isAssignmentExpression()) return true;
            if (!isIdentifier(expression.node.left)) return true;

            const matchingDeclaration = declarations.find((declar) => isIdentifier(declar.node.id) && declar.node.id.name === (<Identifier>expression.node.left).name);
            if (!matchingDeclaration) return true;

            matchingDeclaration.get('init').replaceWith(expression.get('right').node);
            expression.remove();
            return false;
          });

          path.insertBefore(validExpressions.splice(0, -1).map((exp) => exp.node));
          for (let i = 0; i < validExpressions.length - 1; i += 1) {
            validExpressions[i].remove();
          }
          declarator.get('init').replaceWith(validExpressions[validExpressions.length - 1]);
        });
      },
      ExpressionStatement: (path) => {
        const expression = path.get('expression');
        if (!expression.isSequenceExpression() || expression.get('expressions').length <= 1) return;

        this.debugLog('unwrap ExpressionStatement');
        this.debugLog(this.debugPathToCode(path));
        this.debugLog('---');

        path.replaceWithMultiple(expression.get('expressions').map((exp) => exp.node));
      },
    };
  }
}
