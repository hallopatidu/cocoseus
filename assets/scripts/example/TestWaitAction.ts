import { _decorator, Component, log, Node } from 'cc';
import Actionify, { action } from '../cocoseus/modifier/Actionify';
import { Action } from '../cocoseus/types/ModifierType';
import { reference } from '../cocoseus/modifier/Referencify';
const { ccclass, property } = _decorator;

@ccclass('TestWaitAction')
export class TestWaitAction extends Actionify(Component) {

    @property({type:Component})
    waitComp:Component


    start() {

    }

    update(deltaTime: number) {
        
    }

    @action('test_action')
    async showTest(action:Action){
        await this.wait(this.waitComp);
        log('Call success token: ' + this.token + ' from '+ this.node.name)
    }

}


