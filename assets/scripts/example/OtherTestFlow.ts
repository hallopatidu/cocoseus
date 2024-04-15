import { _decorator, Component, Node, Sprite } from 'cc';
import OneFlowify from '../cocoseus/modifier/OneFlowify';
const { ccclass, property } = _decorator;

@ccclass('OtherTestFlow')
export class OtherTestFlow extends OneFlowify(Sprite) {

    @property
    comp:Component = null

    start() {
        
        
    }

    update(deltaTime: number) {
        
    }
}


