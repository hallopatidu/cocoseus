import { _decorator, CCObject, Component, log, Node } from 'cc';
import Parasitify from '../core/Parasitify';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('GHGHGH')
class testGH extends CCObject {

}

@ccclass('TestParasite')
@executeInEditMode(true)
export class TestParasite extends Parasitify(Component) {

    @property
    abcd:string = 'dasdasd'

    protected onLoad(): void {
        log('??????????????????????????????')
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
    protected onDestroy(): void {
        
    }
}


