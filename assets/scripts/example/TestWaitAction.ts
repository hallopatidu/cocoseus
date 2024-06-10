import { _decorator, Component, log, Node, SpriteFrame } from 'cc';
import Actionify, { action } from '../cocoseus/core/Actionify';
import { Action } from '../cocoseus/types/CoreType';
import { reference } from '../cocoseus/core/Referencify';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('TestWaitAction')
@executeInEditMode(true)
export class TestWaitAction extends Actionify(Component) {

    @reference({type:Component})
    waitComp:Component;

    @property({
        type:SpriteFrame
    })
    spriteFrame:SpriteFrame = null;
    // @reference
    // secondComp:Component;

    // @reference
    // get thirdComp():Component{
    //     return this['_thirdComp']
    // }

    // set thirdComp(value:Component){
    //     this['_thirdComp'] = value;
    // }

    start() {
        this.node
    }

    update(deltaTime: number) {
        
    }

    @action('test_action')
    async showTest(action:Action){
        await this.wait(this.waitComp);
        log('Call success token: ' + this.token + ' from '+ this.node.name);
    }

}


