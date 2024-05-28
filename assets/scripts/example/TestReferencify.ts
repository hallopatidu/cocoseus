import { _decorator, Component, log, Node, Prefab, Vec3 } from 'cc';
import  Referencify, { reference }  from '../cocoseus/core/Referencify';
import Decoratify from '../cocoseus/core/Decoratify';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('TestReferencify')
// @executeInEditMode(true)
export class TestReferencify extends Referencify(Component) {

    @reference({type:Prefab})
    abc:Prefab

    protected onLoad(): void {
        // 
        

        
    }

    start() {
        // log('TestReferencify ' + Decoratify(this).keys())
    }

    update(deltaTime: number) {
        
    }
}


