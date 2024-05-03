import { _decorator, Component, log, Node } from 'cc';
import Actionify, { action } from '../cocoseus/modifier/Actionify';
import { Action } from '../cocoseus/types/ModifierType';
const { ccclass, property } = _decorator;

@ccclass('TestAction')
export class TestAction extends Actionify(Component) {

    @action('test_action')
    showTest(action:Action){
        
        log('Call success !!!' + action.type)
    }
    
    start() {

    }

    update(deltaTime: number) {
        
    }
}


