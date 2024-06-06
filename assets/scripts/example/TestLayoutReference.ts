import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import Referencify, { reference } from '../cocoseus/core/Referencify';
const { ccclass, property } = _decorator;

@ccclass('TestLayoutReference')
export class TestLayoutReference extends Referencify(Component) {

    @reference({type:SpriteFrame})
    leftSF:SpriteFrame = null;

    @reference({type:SpriteFrame})
    rightSF:SpriteFrame = null;

    @property({type:Sprite})
    rightSprite:Sprite = null;

    @property({type:Sprite})
    leftSprite:Sprite = null;

    protected onLoad(): void {
        if(this.leftSF && this.leftSprite){
            this.leftSprite.spriteFrame = this.leftSF;
        }

        if(this.rightSF && this.rightSprite){
            this.rightSprite.spriteFrame = this.rightSF;
        }
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


