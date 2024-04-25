import { _decorator, Component, Label, Node, Sprite } from 'cc';
import OneFlowify from '../cocoseus/modifier/OneFlowify';
import { Action } from '../cocoseus/types/ModifierType';
const { ccclass, property } = _decorator;

@ccclass('TestFlow')
export class TestFlow extends OneFlowify(Component) {
    // @reference
    // comp1:Component = null;

    @property({type:Sprite})
    label:Sprite = null

    // start() {
    //     OneFlowify.REFERENCE.GLOBAL
    //     this.testAction();
    // }

    update(deltaTime: number) {
        
    }

    // @action('DEFAULT')
    // public testAction(action?:Action){

    // }

}


