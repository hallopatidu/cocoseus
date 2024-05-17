import { _decorator, Button, Component, Node } from 'cc';
import Actionify from '../cocoseus/core/Actionify';
const { ccclass, property } = _decorator;

@ccclass('ButtonAction')
export class ButtonAction extends Actionify(Button) {
    start() {

    }

    update(deltaTime: number) {
        
    }

    clickTest(){
        this.dispatch({type:'test_action'},'TestWaitAction-001','TestWaitAction-002');
    }
}


