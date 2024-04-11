import { _decorator, Component, Label, log, Node } from 'cc';
import  Parasitify, { override }  from '../cocoseus/modifier/Parasitify';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('LabelUpgrade')
@executeInEditMode(true)
export class LabelUpgrade extends Parasitify<Label>(Component) {
    protected start(): void {
        this.super.string
    }

    @override
    set string(value:string){
        log('Overrided !! ' + value)
        this.super.string = value;
    }
    
}


