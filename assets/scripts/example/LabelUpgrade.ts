import { _decorator, Component, Label, log, Node } from 'cc';
import  Parasitify, { override }  from '../cocoseus/core/Parasitify';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('LabelUpgrade')
@executeInEditMode(true)
export class LabelUpgrade extends Parasitify(Component, Label) {
    protected start(): void {
        
    }

    @override
    set string(value:string){
        log('Overrided !! ' + value)
        this.super.string = value;
    }
    
}


