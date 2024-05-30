import { _decorator, CCClass, Component, Constructor, Enum, log, Node, Script } from 'cc';
import { hadInjectorImplemented } from '../core/Inheritancify';
import Referencify, { INFO_PROPERTY_PREFIX } from '../core/Referencify';
import Decoratify from '../core/Decoratify';
import { EDITOR } from 'cc/env';
import { CCEditor, SimpleAssetInfo } from '../utils/CCEditor';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('PropertyComponent')
@executeInEditMode(true)
export class PropertyComponent extends Component {
    // @property({serializable:true})
    // _script:Script = null;

    // @property({type:Script})
    // get script():Script{
    //     return this._script
    // }
    
    // set script(value:Script){
    //     this._script = value
    // }

    protected onLoad(): void {
        if(EDITOR){
            const comps:Component[] = this.node.getComponents(Component);
            comps.forEach((comp:Component)=>{
                if(hadInjectorImplemented(comp.constructor as Constructor, "Referencify")){                
                    const keys:string[] = Decoratify(comp).keys("@reference")
                    // 
                    keys.forEach((propName:string)=>{
                        const assetInfo:SimpleAssetInfo = comp[INFO_PROPERTY_PREFIX + propName];
                        log('========> ' + comp.name + " prop: " + propName + " : " + JSON.stringify(assetInfo))
                        Object.defineProperty(this, propName, {value:null})
                        const enumObj = {}
                        enumObj[assetInfo.url] = 0
                        CCClass["Attr"].setClassAttr(this, propName, 'type', assetInfo.type);
                    })
                }
            })
        }
    }

    start() {
        // this.script.createNode(function(err, node:Node){
        //     log('node.name:: ' + node.name)
        // })
    }

    update(deltaTime: number) {
        
    }
}


