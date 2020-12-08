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

import { expressionStatement, Identifier, isIdentifier } from '@babel/types';
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

        path.insertBefore(expressions.slice(0, -1).map((exp) => exp.node));
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

          const validExpressions = init.get('expressions').filter((expression) => {
            if (!expression.isAssignmentExpression()) return true;
            if (!isIdentifier(expression.node.left)) return true;

            const matchingDeclaration = declarations.find((declar) => isIdentifier(declar.node.id) && declar.node.id.name === (<Identifier>expression.node.left).name);
            if (!matchingDeclaration) return true;

            matchingDeclaration.get('init').replaceWith(expression.get('right').node);
            expression.remove();
            return false;
          });

          path.insertBefore(validExpressions.slice(0, -1).map((exp) => exp.node));
          for (let i = 0; i < validExpressions.length - 1; i += 1) {
            validExpressions[i].remove();
          }
          declarator.get('init').replaceWith(validExpressions[validExpressions.length - 1]);
        });
      },
      ExpressionStatement: (path) => {
        const expression = path.get('expression');
        if (!expression.isSequenceExpression() || expression.get('expressions').length <= 1) return;

        path.replaceWithMultiple(expression.get('expressions').map((exp) => expressionStatement(exp.node)));
      },
    };
  }
}
