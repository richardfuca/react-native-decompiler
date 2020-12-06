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

import {
  Statement,
  isVariableDeclaration,
  isCallExpression,
  isIdentifier,
  FunctionExpression,
} from '@babel/types';
import { NodePath } from '@babel/traverse';
import { Plugin } from '../../plugin';

/**
 * Moves all requires to the top of the file
 */
export default class RequiresAtTop extends Plugin {
  readonly pass = 2;
  name = 'RequiresAtTop';

  evaluate(path: NodePath<FunctionExpression>): void {
    const bodyPath = this.navigateToModuleBody(path);
    const staging: Statement[] = [];

    bodyPath.node.body.forEach((line) => {
      if (!this.module.requireParam) return staging.push(line);
      if (!isVariableDeclaration(line) || !isCallExpression(line.declarations[0].init) || !isIdentifier(line.declarations[0].init.callee)) return staging.push(line);
      if (!bodyPath.scope.bindingIdentifierEquals(line.declarations[0].init.callee.name, this.module.requireParam)) return staging.push(line);

      return staging.unshift(line);
    });
    bodyPath.node.body = staging;
  }
}
