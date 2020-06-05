import { Tagger } from '../tagger';
import { NodePath } from '@babel/traverse';
import { CallExpression, isMemberExpression, isIdentifier, isCallExpression } from '@babel/types';

export default class PassthroughModuleRemapper extends Tagger {
  evaluate(path: NodePath<CallExpression>): void {
    if (this.module.moduleCode.body.length !== 1) return;
    path.traverse({
      AssignmentExpression: (path) => {
        if (!isMemberExpression(path.node.left)) return path.stop();
        if (!isIdentifier(path.node.left?.object)) return path.stop();
        if (path.scope.getBindingIdentifier(path.node.left.object.name)?.start !== this.module.moduleObjParam.start) return path.stop();
        if (path.node.left.property.name !== 'exports') return path.stop();

        if (!isCallExpression(path.node.right)) return path.stop();
        if (!isIdentifier((path.node.right.callee))) return path.stop();
        if (path.scope.getBindingIdentifier(path.node.right.callee.name)?.start !== this.module.requireParam.start) return path.stop();
        if (!isMemberExpression(path.node.right.arguments[0])) return path.stop();

        const passthroughDependency = this.moduleList[this.module.dependencies[path.node.right?.arguments[0].property.value]];
        this.module.ignored = true;
        this.moduleList.forEach((module) => {
          module.dependencies = module.dependencies.map(dep => dep === this.module.moduleId ? passthroughDependency.moduleId : dep);
        });
      },
    });
  }
}
