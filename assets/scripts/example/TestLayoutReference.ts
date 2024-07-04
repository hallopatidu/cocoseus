import { _decorator, Component, log, Sprite, SpriteFrame } from 'cc';
import { cocoseus } from '../cocoseus/plugins';
const { ccclass, property } = _decorator;

@ccclass('TestLayoutReference')
@cocoseus.propertyDynamicLoading
@cocoseus.exportProperties
export class TestLayoutReference extends Component {

    @property({type:SpriteFrame})
    leftSF:SpriteFrame = null;

    @property({type:SpriteFrame})
    rightSF:SpriteFrame = null;

    @property({type:Sprite})
    rightSprite:Sprite = null;

    @property({type:Sprite})
    leftSprite:Sprite = null;

    protected onLoad(): void {
        log('Loaded test layout !!!')
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


