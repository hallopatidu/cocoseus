import { _decorator, CCClass, CCObject, Component, Constructor, Enum, js, log, Node, Script } from 'cc';
import { hadInjectorImplemented } from '../core/Inheritancify';
import Referencify, { INFO_PROPERTY_PREFIX } from '../core/Referencify';
import Decoratify from '../core/Decoratify';
import { EDITOR } from 'cc/env';
import { CCEditor, SimpleAssetInfo } from '../utils/CCEditor';
const { ccclass, property, executeInEditMode } = _decorator;

// @ccclass('PropertyField')
// class PropertyField {
//     @property({type:CCObject})
//     key:any = null;
// }


@ccclass('PropertyComponent')
@executeInEditMode(true)
export class PropertyComponent extends Component {
    
    // @property({type:[PropertyField]})
    // properties:PropertyField[] = []

    protected onLoad(): void {
        // if(EDITOR){
        //     const comps:Component[] = this.node.getComponents(Component);
        //     comps.forEach((comp:Component)=>{
        //         if(hadInjectorImplemented(comp.constructor as Constructor, "Referencify")){                
        //             const keys:string[] = Decoratify(comp).keys("@reference");
        //             // class A extends (comp.constructor as unknown as Constructor<Component>) {
        //             // }
        //             // this.node.addComponent(A);
        //             // 
        //             keys.forEach((propName:string)=>{
        //                 const assetInfo:SimpleAssetInfo = comp[INFO_PROPERTY_PREFIX + propName];
        //                 log('========> ' + comp.name + " prop: " + propName + " : " + JSON.stringify(assetInfo));
        //                 Object.defineProperty(this, propName, {value:null});
        //                 const enumObj = {};
        //                 enumObj[assetInfo.url] = 0;
        //                 // CCClass["Attr"].setClassAttr(this, propName, 'type', assetInfo.type);
        //             })
        //         }
        //     })
        // }
    }

    start() {
        // this.script.createNode(function(err, node:Node){
        //     log('node.name:: ' + node.name)
        // })
        
    }

    update(deltaTime: number) {
        
    }
}


