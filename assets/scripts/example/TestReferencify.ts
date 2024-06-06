import { _decorator, Component, error, instantiate, log, Node, Prefab, Sprite, SpriteFrame, Vec3 } from 'cc';
import  Referencify, { reference }  from '../cocoseus/core/Referencify';
import Decoratify from '../cocoseus/core/Decoratify';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('TestReferencify')
// @executeInEditMode(true)
export class TestReferencify extends Referencify(Component) {

    @reference({type:Prefab})
    abc:Prefab = null;

    @reference({type:SpriteFrame})
    sp:SpriteFrame = null

    protected onLoad(): void {
        // 
        // if(!this.sp) error('unload asset !!')
        // const sprite:Sprite = this.node.getComponent(Sprite)||this.node.addComponent(Sprite);
        // sprite.spriteFrame = this.sp;
        if(!this.abc) error('unload asset !!')
        else{
            const node:Node = instantiate(this.abc);
            node.setPosition(new Vec3);
            this.node.addChild(node)
        }
        // 
        // if(!this.sp) error('sp unload asset !!')
        // else {
        //     const sprite:Sprite = this.node.getComponent(Sprite)
        //     sprite.spriteFrame = this.sp;
            
        // }

    }

    
}


