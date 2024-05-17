import { _decorator, Component, log, Node } from 'cc';
import Actionify, { action } from '../cocoseus/core/Actionify';
import { Action } from '../cocoseus/types/ModifierType';
import { reference } from '../cocoseus/core/Referencify';
const { ccclass, property } = _decorator;

@ccclass('TestWaitAction')
export class TestWaitAction extends Actionify(Component) {

    @property({type:Component})
    waitComp:Component

    @reference
    secondComp:Component

    start() {

    }

    update(deltaTime: number) {
        
    }

    @action('test_action')
    async showTest(action:Action){
        await this.wait(this.waitComp);
        log('Call success token: ' + this.token + ' from '+ this.node.name);
    }

}


