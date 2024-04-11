import { _decorator, Component, log, Node } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('Test')
@executeInEditMode(true)
export class Test extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }

    public get internalOnLoad (): (() => void) | undefined {
        
        log('uuid:: ' + this.uuid + JSON.stringify(this.__editorExtras__) + ' hasFunc: ' + !!super['internalOnLoad'] + ' -_objFlags: ' + this['_objFlags'] )        
        return super['internalOnLoad']
    }
}


