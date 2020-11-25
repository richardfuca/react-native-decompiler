import { Visitor } from '@babel/traverse';
import {
  isMemberExpression,
  isIdentifier,
  jsxElement,
  isObjectProperty,
  isStringLiteral,
  jsxAttribute,
  jsxIdentifier,
  isBooleanLiteral,
  jsxExpressionContainer,
  isExpression,
  JSXAttribute,
  jsxOpeningElement,
  jsxMemberExpression,
  JSXIdentifier,
  JSXMemberExpression,
  isObjectExpression,
} from '@babel/types';
import { Plugin } from '../../plugin';

/**
 * Converts React.createElement to JSX
 */
export default class JSXConverter extends Plugin {
  readonly pass = 2;

  getVisitor(): Visitor {
    return {
      CallExpression: (path) => {
        if (!isMemberExpression(path.node.callee) || !isIdentifier(path.node.callee.object) || !isIdentifier(path.node.callee.property)) return;
        if (path.node.callee.object.name !== 'React' || path.node.callee.property.name !== 'createElement') return;

        const args = path.node.arguments;
        if (!isObjectExpression(args[1])) return;

        let name: JSXIdentifier | JSXMemberExpression | undefined;
        if (isIdentifier(args[0])) {
          name = jsxIdentifier(args[0].name);
        } else if (isMemberExpression(args[0]) && isIdentifier(args[0].object) && isIdentifier(args[0].property)) {
          name = jsxMemberExpression(jsxIdentifier(args[0].object.name), jsxIdentifier(args[0].property.name));
        } else {
          return;
        }

        if (args.length > 2) return; // children not yet supported

        const props: JSXAttribute[] = args[1].properties.map((prop) => {
          if (!isObjectProperty(prop) || !isIdentifier(prop.key)) return null;
          if (isStringLiteral(prop.value)) {
            return jsxAttribute(jsxIdentifier(prop.key.name), prop.value);
          }
          if (isBooleanLiteral(prop.value) && prop.value.value) {
            return jsxAttribute(jsxIdentifier(prop.key.name), null);
          }
          if (isExpression(prop.value)) {
            return jsxAttribute(jsxIdentifier(prop.key.name), jsxExpressionContainer(prop.value));
          }
          return null;
        }).filter((e): e is JSXAttribute => e != null);

        path.replaceWith(jsxElement(jsxOpeningElement(name, props, true), null, []));
        this.module.tags.push('jsx');
      },
    };
  }
}
