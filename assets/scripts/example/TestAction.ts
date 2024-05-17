import { _decorator, Component, log, Node } from 'cc';
import Actionify, { action } from '../cocoseus/core/Actionify';
import { Action } from '../cocoseus/types/ModifierType';
// import { Support } from '../cocoseus/utils/Support';
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
        // a= 34, b =45, c= 89, d= 405, e= 231
        // const graph = {
        //     34: [45, 89],
        //     45: [405, 89],
        //     231: [34, 45],
        //     405: [231]
        // };

        // log("Circle :: " + Support.getCycle(graph));
    }

    update(deltaTime: number) {
        
    }
}


