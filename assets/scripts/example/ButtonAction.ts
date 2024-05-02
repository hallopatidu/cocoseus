import { _decorator, Button, Component, Node } from 'cc';
import Actionify from '../cocoseus/modifier/Actionify';
const { ccclass, property } = _decorator;

@ccclass('ButtonAction')
export class ButtonAction extends Actionify(Button) {
    start() {

    }

    update(deltaTime: number) {
        
    }

    clickTest(){
        this.dispatch({type:'test_action'})
    }
}


