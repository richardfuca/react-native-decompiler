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

import * as t from '@babel/types';
import { NodePath, Visitor } from '@babel/traverse';
import { Plugin } from '../../../plugin';
import ArrayMap from '../../../util/arrayMap';

/**
 * Evaluates Babel class structures
 */
export default class BabelClassEvaluator extends Plugin {
  readonly pass = 2;
  private classCreateName?: string;
  private classCreatePath?: NodePath<t.VariableDeclarator>;
  private callExpressions: ArrayMap<string, NodePath<t.CallExpression>> = new ArrayMap();

  getVisitor(): Visitor {
    return {
      VariableDeclarator: (path) => {
        if (!t.isIdentifier(path.node.id)) return;
        if (this.variableIsForDependency(path, '@babel/runtime/helpers/createClass')) {
          this.classCreateName = path.node.id.name;
          this.classCreatePath = path;
        }
      },
      CallExpression: (path) => {
        if (!t.isIdentifier(path.node.callee)) return;

        this.callExpressions.push(path.node.callee.name, path);
      },
    };
  }

  afterPass(): void {
    if (!this.classCreateName || !this.callExpressions.has(this.classCreateName)) return;

    this.callExpressions.forEachElement(this.classCreateName, (path) => {
      if (path.removed) return;

      const varDeclar = path.find((e) => e.isVariableDeclarator());
      if (!varDeclar?.isVariableDeclarator() || !t.isIdentifier(varDeclar.node.id) || !t.isVariableDeclaration(varDeclar.parent)) return;

      const methods = [];

      const constructor = this.createConstructor(path);
      if (constructor) {
        methods.push(constructor);
      }

      methods.push(...this.createMethods(path));

      if (varDeclar.parent.declarations.length === 1) {
        varDeclar.parentPath.replaceWith(t.classDeclaration(t.identifier(varDeclar.node.id.name), undefined, t.classBody(methods)));
      } else {
        varDeclar.parentPath.insertAfter(t.classDeclaration(t.identifier(varDeclar.node.id.name), undefined, t.classBody(methods)));
        varDeclar.remove();
      }
    });

    this.classCreatePath?.remove();
  }

  private createConstructor(path: NodePath<t.CallExpression>): t.ClassMethod | null {
    const firstParam = path.get('arguments')[0];
    if (!firstParam?.isIdentifier()) return null;

    const constructorFunction = firstParam.scope.getBinding(firstParam.node.name)?.path;
    if (!constructorFunction?.isFunctionDeclaration()) return null;

    return t.classMethod('constructor', t.identifier('constructor'), constructorFunction.node.params, constructorFunction.node.body);
  }

  private createMethods(path: NodePath<t.CallExpression>): t.ClassMethod[] {
    const secondParam = path.get('arguments')[1];
    if (!secondParam?.isArrayExpression()) return [];

    const methods: t.ClassMethod[] = [];
    secondParam.node.elements.forEach((e) => {
      if (!t.isObjectExpression(e) || !t.isObjectProperty(e.properties[0]) || !t.isObjectProperty(e.properties[1])) return;
      if (!t.isIdentifier(e.properties[0].key) || !t.isStringLiteral(e.properties[0].value) || !t.isFunctionExpression(e.properties[1].value)) return;

      methods.push(t.classMethod('method', t.identifier(e.properties[0].value.value), e.properties[1].value.params, e.properties[1].value.body));
    });

    return methods;
  }
}
