import { _decorator, Component, error, instantiate, log, Node, Prefab, Sprite, SpriteFrame, Vec3, warn } from 'cc';
import { cocoseus } from '../cocoseus';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('TestReferencify')
// @executeInEditMode(true)
// export class TestReferencify extends Referencify(Component) {
@cocoseus.propertyLazyLoading
export class TestReferencify extends Component {

    // @reference({type:Prefab})
    // abc:Prefab = null;

    // @reference({type:SpriteFrame})
    // sp:SpriteFrame = null
    
    @property({type:Prefab})
    abc:Prefab = null;

    @property({type:SpriteFrame})
    sp:SpriteFrame = null

    protected start(): void {
        console.log('START !!!!!!!!!!!!!')
    }

    protected onLoad(): void {
        // 
        console.log('AABBCC Loaded !!!!')
        // if(!this.sp) error('unload asset !!')
        // const sprite:Sprite = this.node.getComponent(Sprite)||this.node.addComponent(Sprite);
        // sprite.spriteFrame = this.sp;
        if(!this.abc) {
            warn('unload asset !!')
            console.log('unload asset !!');
        }else{
            const node:Node = instantiate(this.abc);
            node.setPosition(new Vec3);
            this.node.addChild(node)
        }
        
        if(!this.sp) error('sp unload asset !!')
        else {
            const sprite:Sprite = this.node.getComponent(Sprite)
            sprite.spriteFrame = this.sp;
            
        }

    }

    
}


