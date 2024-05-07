import { _decorator, Component, log, Node } from 'cc';
import Actionify, { action } from '../cocoseus/modifier/Actionify';
import { Action } from '../cocoseus/types/ModifierType';
const { ccclass, property } = _decorator;

@ccclass('TestAction')
export class TestAction extends Actionify(Component) {

    @action('test_action')
    async showTest(action:Action){
        await new Promise((resolve:Function)=>{
            setTimeout(resolve, 2000)
        })
        log('Call success ' + this.node.name)
    }
    
    start() {

    }

    update(deltaTime: number) {
        
    }
}


