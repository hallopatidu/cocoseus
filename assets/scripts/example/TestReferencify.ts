import { _decorator, Component, log, Node } from 'cc';
import  Referencify, { reference }  from '../cocoseus/modifier/Referencify';
import Decoratify from '../cocoseus/modifier/Decoratify';
const { ccclass, property } = _decorator;

@ccclass('TestReferencify')
export class TestReferencify extends Referencify(Component) {

    @reference
    abc:string

    start() {
        log('TestReferencify ' + Decoratify(this).keys())
    }

    update(deltaTime: number) {
        
    }
}


