import { _decorator, Component, Node } from 'cc';
import  Referencify, { reference }  from '../cocoseus/modifier/Referencify';
const { ccclass, property } = _decorator;

@ccclass('TestReferencify')
export class TestReferencify extends Referencify(Component) {

    @reference
    abc:string

    start() {
        
    }

    update(deltaTime: number) {
        
    }
}


