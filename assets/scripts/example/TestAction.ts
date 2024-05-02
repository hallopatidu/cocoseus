import { _decorator, Component, log, Node } from 'cc';
import Actionify, { action } from '../cocoseus/modifier/Actionify';
const { ccclass, property } = _decorator;

@ccclass('TestAction')
export class TestAction extends Actionify(Component) {

    @action('test_action')
    showTest(){
        log('Call success !!!')
    }
    
    start() {

    }

    update(deltaTime: number) {
        
    }
}


