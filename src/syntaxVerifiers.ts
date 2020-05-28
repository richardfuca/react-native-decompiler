import { CallExpression, Identifier, NumericLiteral } from '@babel/types';

export default class SyntaxVerifier {
  static verifyValidModuleFunction(node: CallExpression) {
    const moduleFunctionNode = node.arguments[0];
    const moduleIdNode = node.arguments[1];
    const dependenciesNode = node.arguments[2];
    if (moduleFunctionNode.type !== 'FunctionExpression') {
      throw new SyntaxError(`Param 1 of __d should be a function but got ${moduleIdNode.type}`);
    }
    const moduleFunctionParams = moduleFunctionNode.params;
    if (moduleFunctionParams.length !== 5 && moduleFunctionParams.length !== 7) {
      throw new SyntaxError(`Param 1 of __d should be a function with 5 or 7 params but got ${moduleFunctionNode.params.length} params`);
    }
    if (moduleFunctionParams.some(node => node == null || node.type !== 'Identifier')) {
      throw new SyntaxError(`Param 1 of __d should be a fun with 5 Identifiers but got ${moduleFunctionNode.params.map(n => !n || n.type)}`);
    }
    if (moduleIdNode.type !== 'NumericLiteral') throw new SyntaxError(`Param 2 of __d should be a number but got ${moduleIdNode.type}`);
    if (dependenciesNode.type !== 'ArrayExpression') throw new SyntaxError(`Param 3 of __d should be a array but got ${dependenciesNode.type}`);
    if (dependenciesNode.elements.some(node => node == null || node.type !== 'NumericLiteral')) {
      throw new SyntaxError(`Param 3 of __d should be a number array but got ${(dependenciesNode.elements).map(n => !n || n.type)}`);
    }
    return {
      moduleIdNode,
      moduleFunctionNode,
      dependenciesNums: (<NumericLiteral[]>dependenciesNode.elements).map(n => n.value),
      moduleFunctionParams: <Identifier[]>moduleFunctionParams,
    };
  }

  static verifyValidModuleRequire(node: CallExpression, depMapName: string) {
    const requireArgument = node.arguments[0];
    if (requireArgument.type !== 'MemberExpression') {
      throw new Error(`Require param should be accessing an array but got ${requireArgument.type}`);
    }
    if (requireArgument.object.type !== 'Identifier') {
      throw new Error(`Require param should be accessing an array but got ${requireArgument.object.type}`);
    }
    if (requireArgument.object.name !== depMapName) {
      throw new Error(`Require param should be accessing the dependency array but got ${requireArgument.object.name}`);
    }
    const requireArrayProperty: NumericLiteral = requireArgument.property;
    if (requireArrayProperty.type !== 'NumericLiteral') {
      throw new Error(`Require param should be accessing the dependency array using a constant but got ${requireArrayProperty.type}`);
    }
    return {
      requiredModule: requireArrayProperty,
    };
  }
}
