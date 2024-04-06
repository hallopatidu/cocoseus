import { _decorator, Component, Label, Node } from 'cc';
import { Parasitify } from '../cocoseus/modifier/Parasitify';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('LabelUpgrade')
@executeInEditMode(true)
export class LabelUpgrade extends Parasitify(Component, Label) {
    start() {
        
    }
    
    update(deltaTime: number) {
        
    }

    
}


