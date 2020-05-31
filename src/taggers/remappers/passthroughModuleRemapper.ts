import { Tagger } from '../tagger';
import { NodePath } from '@babel/traverse';
import { CallExpression } from '@babel/types';

export default class PassthroughModuleRemapper extends Tagger {
  evaluate(path: NodePath<CallExpression>): void {
    path.traverse({
      AssignmentExpression: (path) => {
        if (path.node.left?.type !== 'MemberExpression') return path.stop();
        if (path.node.left?.object?.type !== 'Identifier') return path.stop();
        if (path.scope.bindings[path.node.left.object.name]?.identifier?.start !== this.module.moduleObjParam.start) return path.stop();
        if (path.node.left.property.name !== 'exports') return path.stop();

        if (path.node.right?.type !== 'CallExpression') return path.stop();
        if (path.node.right?.callee.type !== 'Identifier') return path.stop();
        if (path.scope.bindings[path.node.right.callee.name]?.identifier?.start !== this.module.requireParam.start) return path.stop();
        if (path.node.right.arguments[0].type !== 'MemberExpression') return path.stop();

        const passthroughDependency = this.moduleList[this.module.dependencies[path.node.right?.arguments[0].property.value]];
        this.moduleList.forEach((module) => {
          module.dependencies = module.dependencies.map(dep => dep === this.module.moduleId ? passthroughDependency.moduleId : dep);
        });
      },
    });
  }
}
