import { _decorator, Component, Node, Sprite } from 'cc';
import OneFlowify, { OneFlowComponent } from '../cocoseus/modifier/OneFlowify';
const { ccclass, property } = _decorator;

@ccclass('OtherTestFlow')
export class OtherTestFlow extends OneFlowify(Sprite) {

    @property({type:OneFlowComponent})
    comp:OneFlowComponent = null

    start() {
        
        
    }

    update(deltaTime: number) {
        
    }
}


