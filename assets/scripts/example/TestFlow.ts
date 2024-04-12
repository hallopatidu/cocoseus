import { _decorator, Component, Node } from 'cc';
import OneFlowify, { action, OneFlowComponent, reference } from '../cocoseus/modifier/OneFlowify';
import { Action } from '../cocoseus/types/ModifierType';
const { ccclass, property } = _decorator;

@ccclass('TestFlow')
export class TestFlow extends OneFlowify(Component) {
    @reference({type:OneFlowComponent})
    comp1:OneFlowComponent = null;

    start() {
        OneFlowify.REFERENCE.GLOBAL
        
    }

    update(deltaTime: number) {
        
    }

    @action('DEFAULT')
    public testAction(action:Action){

    }

}


