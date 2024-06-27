import { _decorator, Component, log, Sprite } from 'cc';
import { cocoseus } from '../cocoseus/plugins';
const { ccclass, property } = _decorator;

@ccclass('TestLayoutReference')
@cocoseus.propertyDynamicLoading
export class TestLayoutReference extends Component {

    // @reference({type:SpriteFrame})
    // leftSF:SpriteFrame = null;

    // @reference({type:SpriteFrame})
    // rightSF:SpriteFrame = null;

    @property({type:Sprite})
    rightSprite:Sprite = null;

    @property({type:Sprite})
    leftSprite:Sprite = null;

    protected onLoad(): void {
        log('Loaded test layout !!!')
        // if(this.leftSF && this.leftSprite){
        //     this.leftSprite.spriteFrame = this.leftSF;
        // }

        // if(this.rightSF && this.rightSprite){
        //     this.rightSprite.spriteFrame = this.rightSF;
        // }
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


