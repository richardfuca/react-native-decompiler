import { NodePath, Visitor } from '@babel/traverse';
import { callExpression, FunctionDeclaration, Identifier, identifier, isConditionalExpression, isIdentifier, isLogicalExpression, isMemberExpression, isReturnStatement, stringLiteral, VariableDeclaration, variableDeclaration, variableDeclarator } from '@babel/types';
import { Plugin } from '../../plugin';

/**
 * Converts inlines to requires for decompilers
 */
export default class BabelInlineConverters extends Plugin {
  readonly pass = 1;

  getVisitor(): Visitor {
    return {
      FunctionDeclaration: (nodePath) => {
        this.interopRequireDefaultTest(nodePath);
      },
    };
  }

  private generateRequire(name: Identifier, requireModule: string): VariableDeclaration {
    return variableDeclaration('const', [
      variableDeclarator(name, callExpression(identifier('require'), [stringLiteral(requireModule)])),
    ]);
  }

  private interopRequireDefaultTest(nodePath: NodePath<FunctionDeclaration>) {
    const body = nodePath.node.body.body;
    if (nodePath.node.params.length !== 1 || body.length !== 1 || !isIdentifier(nodePath.node.id) || !isReturnStatement(body[0])) return;
    if (!isConditionalExpression(body[0].argument) || !isLogicalExpression(body[0].argument.test)) return;
    if (!isIdentifier(body[0].argument.test.left) || body[0].argument.test.operator !== '&&' || !isMemberExpression(body[0].argument.test.right)) return;
    const esModuleExpression = body[0].argument.test.right;
    if (!isIdentifier(esModuleExpression.object) || !isIdentifier(esModuleExpression.property) || body[0].argument.test.left.name !== esModuleExpression.object.name) return;
    if (esModuleExpression.property.name !== '__esModule') return;
    nodePath.replaceWith(this.generateRequire(nodePath.node.id, '@babel/runtime/helpers/interopRequireDefault'));
    this.addTag('babel-interop');
  }
}
