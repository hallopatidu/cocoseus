import { _decorator, Asset, CCClass, CCObject, Component, Constructor, Enum, js, log, Node, Prefab, Script } from 'cc';
import { hadInjectorImplemented } from '../core/Inheritancify';
import Referencify, { INFO_PROPERTY_PREFIX, reference } from '../core/Referencify';
import Decoratify from '../core/Decoratify';
import { EDITOR } from 'cc/env';
import { CCEditor, SimpleAssetInfo } from '../utils/CCEditor';
import Parasitify, { override } from '../core/Parasitify';
import { Support } from '../utils/Support';
import { IReferencified } from '../types/CoreType';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('PropertyElement')
class PropertyElement extends Referencify(CCObject) {
    @property
    nodePath:string = '';

    @property
    comp:string = '';

    @property
    prop:string = '';    
}

type PropertyField = {
    node:string,
    comp:string,
    property:string,
    value:SimpleAssetInfo
}

type PropertyData = {
    [n:string]:PropertyField
}

@ccclass('PropertyComponent')
@executeInEditMode(true)
export class PropertyComponent extends Parasitify(Component) {
    
    // @reference({
    //     type:Prefab
    // })
    // prefab:Prefab = null

    @property({serializable:true, visible:false, readonly:true})
    assetStores:Map<string, PropertyData> = new Map();

    // @property


    @override
    protected async referencingAsset(propertyName:string, simpleAssetInfo:SimpleAssetInfo){      
        if(EDITOR){
            if(!simpleAssetInfo){
                log('delete !!!')
                this.assetStores.has(propertyName) && this.assetStores.delete(propertyName);
            }
            // const assetInfo = await globalThis.Editor.Message.request('asset-db', 'query-asset-info', simpleAssetInfo.uuid);
            // log(propertyName + '--------------' + this.data.has(propertyName))
        }
        await this.super['referencingAsset'](propertyName, simpleAssetInfo);
    }

    @override
    protected async updateAsset(propertyName:string, asset:Asset){        
        if(asset && js.isChildClassOf(asset.constructor, Prefab)){
            // log('---------------------');
            if(!this.assetStores.has(propertyName)){
                this.assetStores.set(propertyName, Object.create(null));
            }
            const propertyData:PropertyData = this.assetStores.get(propertyName);
            let allPrefabComponents:Component[] = ((asset as Prefab).data as Node).getComponentsInChildren(Component);
            allPrefabComponents = allPrefabComponents.map((comp:Component)=>{
                const isRefComp:boolean = hadInjectorImplemented(comp.constructor as Constructor, 'Referencify');
                if(isRefComp){
                    const nodePath:string = comp.node.getPathInHierarchy();
                    const compName:string = js.getClassName(comp);
                    // 
                    const loadedPropertyNames:string[] = Array.from(Decoratify(comp).keys('@reference'));
                    loadedPropertyNames.forEach((propName:string)=>{
                        const propertyName:string = propName;
                        // const propArr:string[] = propName?.split("::");
                        // const propertyName:string = propArr[0];
                        // const classTypeName:string = propArr[1];
                        // if(propertyName && classTypeName){                            
                        if(propertyName){
                            const propField:PropertyField = Object.create(null);
                            // const assetInfo:SimpleAssetInfo = comp[INFO_PROPERTY_PREFIX + propertyName];
                            propField.comp = compName;
                            propField.property = propertyName;
                            // propField.value = assetInfo;
                            propField.node = nodePath;
                            const key:string = this.genAssetKey(propField.node, propField.comp, propField.property);
                            propertyData[key] = propField;
                        }
                    })
                }
                return isRefComp ? comp : null;
            })

        }
        return await this.super['updateAsset'](propertyName, asset);
    }
    
    /**
     * 
     * @param propField 
     * @returns 
     */
    protected genAssetKey(...props:string[]):string{        
        return props.reduce((value:string, currentValue:string)=> value + Support.tokenize(currentValue) + '.', '');
    }

    protected onLoad(): void {
        // log('Key:: ' + this.assetStores.keys().next().value)
    }

    protected onDestroy(): void {
        
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


