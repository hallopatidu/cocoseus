import { _decorator, Component, instantiate, Node, Prefab, SpriteFrame, Vec3, warn } from 'cc';
import { cocoseus } from '../cocoseus/plugins';


const { ccclass, property } = _decorator;

@ccclass('SuperTestReferancify')
@cocoseus.propertyDynamicLoading
export class SuperTestReferancify extends Component {

    @property
    taskName:string = ''

    private _getTesttaskName: string = '';
    @property
    public get getTesttaskName(): string {
        return this._getTesttaskName;
    }
    public set getTesttaskName(value: string) {
        this._getTesttaskName = value;
    }
    
    @property({type:Prefab})
    abc:Prefab = null;

    @property({type:SpriteFrame})
    sp:SpriteFrame = null

    protected onLoad(): void {        
        if(!this.abc) {
            warn('unload asset !!')
            console.log('unload asset !!');
        }else{
            const node:Node = instantiate(this.abc);
            node.setPosition(new Vec3);
            this.node.addChild(node)
        }
    }

}


