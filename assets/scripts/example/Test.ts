import { _decorator, Component, log, Node } from 'cc';
import { Support } from '../cocoseus/utils/Support';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('Test')
@executeInEditMode(true)
export class Test extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }

    public get internalOnLoad (): (() => void) | undefined {
               
        return super['internalOnLoad']
    }
}


