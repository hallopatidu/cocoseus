import { _decorator, Component, Label, log, Node, Sprite, Vec3 } from 'cc';
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
    //     // OneFlowify.REFERENCE.GLOBAL
    //     // this.testAction();

        
    // }

    // protected onLoad(): void {
    //     const map:Map<Vec3, string> = new Map()
    //     map.set(new Vec3(2,4,6), 'hello');

    //     log('Test map ' + map.get(new Vec3(2,4,6)))
    // }

    update(deltaTime: number) {
        
    }

    // @action('DEFAULT')
    // public testAction(action?:Action){

    // }

}


