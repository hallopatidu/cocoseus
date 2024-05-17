import { _decorator, Component, log, Node, Vec3 } from 'cc';
import  Referencify, { reference }  from '../cocoseus/core/Referencify';
import Decoratify from '../cocoseus/core/Decoratify';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('TestReferencify')
@executeInEditMode(true)
export class TestReferencify extends Referencify(Component) {

    @reference
    abc:string

    protected onLoad(): void {
        log('--------------------------- ')
        const indexVec:Vec3=new Vec3(2,4,6)
        const map:Map<Vec3, string> = new Map()
        map.set(indexVec, 'hello');

        log('Test map ' + map.get(indexVec))
    }

    start() {
        log('TestReferencify ' + Decoratify(this).keys())
    }

    update(deltaTime: number) {
        
    }
}


