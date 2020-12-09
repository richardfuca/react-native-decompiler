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

import { Visitor } from '@babel/traverse';
import { isIdentifier, stringLiteral } from '@babel/types';
import { Plugin } from '../../plugin';

/**
 * Maps the webpack requires to their file/NPM counterparts (that we generate)
 */
export default class RequireMapper extends Plugin {
  readonly pass = 1;

  getVisitor(): Visitor {
    return {
      CallExpression: (path) => {
        if (!isIdentifier(path.node.callee)) return;

        const moduleDependency = this.getModuleDependency(path);
        if (moduleDependency == null) return;

        path.get('arguments')[0].replaceWith(stringLiteral(`${moduleDependency.isNpmModule ? '' : './'}${moduleDependency.moduleName}`));
        const parent = path.parentPath;
        if (!parent.isVariableDeclarator()) return;
        if (!isIdentifier(parent.node.id)) return;
        path.scope.rename(parent.node.id.name, moduleDependency.npmModuleVarName || `module${moduleDependency.moduleId}`);
      },
    };
  }
}
