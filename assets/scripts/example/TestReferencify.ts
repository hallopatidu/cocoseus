import { _decorator, Component, error, instantiate, log, Node, Prefab, Vec3 } from 'cc';
import  Referencify, { reference }  from '../cocoseus/core/Referencify';
import Decoratify from '../cocoseus/core/Decoratify';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('TestReferencify')
// @executeInEditMode(true)
export class TestReferencify extends Referencify(Component) {

    @reference({type:Prefab})
    abc:Prefab = null;

    protected onLoad(): void {
        // 
        // if(!this.abc) error('unload asset !!')
        // const node:Node = instantiate(this.abc);
        // node.setPosition(new Vec3);
        // this.node.addChild(node)
        
    }

    

    start() {
        // log('TestReferencify ' + Decoratify(this).keys())
        if(!this.abc) error('unload asset !!')
            const node:Node = instantiate(this.abc);
            node.setPosition(new Vec3);
            this.node.addChild(node)
    }

    update(deltaTime: number) {
        
    }
}


