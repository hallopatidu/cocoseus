import { _decorator, Component, log, Node } from 'cc';
import Decoratify from '../cocoseus/modifier/Decoratify';
const { ccclass, property } = _decorator;

@ccclass('TestDecoratify')
export class TestDecoratify extends Decoratify(Component) {
    start() {
        log('TestDecoratify ' + Decoratify(this).keys())
    }

    update(deltaTime: number) {
        
    }
}


