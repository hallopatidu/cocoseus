import { _decorator, Component, Node } from 'cc';
import Decoratify from '../cocoseus/modifier/Decoratify';
const { ccclass, property } = _decorator;

@ccclass('TestDecoratify')
export class TestDecoratify extends Decoratify(Component) {
    start() {

    }

    update(deltaTime: number) {
        
    }
}


