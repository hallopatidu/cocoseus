import { _decorator, Asset, CCClass, CCObject, Component, Constructor, Enum, js, log, Node, Prefab, Script } from 'cc';
import { hadInjectorImplemented } from '../core/Inheritancify';
import Referencify, { INFO_PROPERTY_PREFIX, reference } from '../core/Referencify';
import Decoratify from '../core/Decoratify';
import { EDITOR } from 'cc/env';
import { CCEditor, SimpleAssetInfo } from '../utils/CCEditor';
import Parasitify, { override } from '../core/Parasitify';
const { ccclass, property, executeInEditMode } = _decorator;

// @ccclass('PropertyField')
// class PropertyField {
//     @property({type:CCObject})
//     key:any = null;
// }

type PropertyField = {
    node:string,
    comp:string,
    name:string
}

@ccclass('PropertyComponent')
@executeInEditMode(true)
export class PropertyComponent extends Parasitify(Component) {
    
    // @reference({
    //     type:Prefab
    // })
    // prefab:Prefab = null

    @property({serializable:true, visible:false})
    __assets:PropertyField[] = [];

    @override
    protected async referencingAsset(propertyName:string, simpleAssetInfo:SimpleAssetInfo){      
        if(EDITOR){
            const assetInfo = await globalThis.Editor.Message.request('asset-db', 'query-asset-info', simpleAssetInfo.uuid);
            log('--------------' + assetInfo.name)
        }
        await this.super['referencingAsset'](propertyName, simpleAssetInfo);
    }

    @override
    protected async updateAsset(propertyName:string, asset:Asset){        
        if(asset && js.isChildClassOf(asset.constructor, Prefab)){
            log('---------------------');  
            let allPrefabComponents:Component[] = ((asset as Prefab).data as Node).getComponentsInChildren(Component);
            allPrefabComponents = allPrefabComponents.map((comp:Component)=>{
                const isRefComp:boolean = hadInjectorImplemented(comp.constructor as Constructor, 'Referencify');
                if(isRefComp){
                    const loadedPropertyNames:string[] = Array.from(Decoratify(comp).keys('@reference.load'));
                    loadedPropertyNames.forEach((propName:string)=>{
                        const propArr:string[] = propName?.split("::");
                        const propertyName:string = propArr[0];
                        const classTypeName:string = propArr[1];
                        if(propertyName && classTypeName){
                            const assetInfo:SimpleAssetInfo = comp[INFO_PROPERTY_PREFIX + propertyName];
                            
                        }
                    })
                }
                return isRefComp ? comp : null;
            })

        }
        return await this.super['updateAsset'](propertyName, asset);
    }
    
    // protected onLoad(): void {        
    //     // if(EDITOR){
    //     //     let comps:Component[] =  this.node.getComponentsInChildren(Component);
    //     //     comps = comps.map((comp:Component)=>{
    //     //         const isRefComp:boolean = hadInjectorImplemented(comp.constructor as Constructor, 'Referencify') ? true : false;
    //     //         if(isRefComp){
    //     //             const loadedPropertyNames:string[] = Array.from(Decoratify(comp).keys('@reference.load'));                    
    //     //             loadedPropertyNames.forEach((propName:string)=>{                        
    //     //                 const propArr:string[] = propName?.split("::");
    //     //                 const propertyName:string = propArr[0];
    //     //                 const classTypeName:string = propArr[1];
    //     //                 if(propertyName && classTypeName){                            
    //     //                     const assetInfo:SimpleAssetInfo = comp[INFO_PROPERTY_PREFIX + propertyName]
    //     //                     if(js.isChildClassOf(js.getClassByName(assetInfo.type), Prefab)){
    //     //                     }
    //     //                 }
    //     //             })
    //     //         }
    //     //         return isRefComp ? comp : null
    //     //     })
    //     // }
    // }

    
}


