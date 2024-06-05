import { _decorator, Asset, CCClass, CCObject, Component, Constructor, js, log, Prefab } from 'cc';
import Parasitify, { override } from '../core/Parasitify';
import { hadInjectorImplemented } from '../core/Inheritancify';
import Decoratify from '../core/Decoratify';
import Referencify, { INFO_PROPERTY_PREFIX, PrefabInfo, reference } from '../core/Referencify';
import { SimpleAssetInfo } from '../utils/CCEditor';
import { ReferenceInfo } from '../types/CoreType';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('ReferenceInfoView')
class ReferenceInfoView extends Referencify(CCObject) {
    @property({readonly:true})
    nodePath:string = '';

    @property({readonly:true})
    component:string = ''
    
    @property({readonly:true})
    key:string = ''

    @reference({type:Asset})
    value:Asset = null;
    

    private info:ReferenceInfo = null;
    /**
     * 
     * @param refInfo 
     */
    constructor(refInfo:ReferenceInfo, type:string){        
        super();        
        this.info = refInfo;
        this.nodePath = refInfo?.node;
        this.component = refInfo?.comp;
        this.key = refInfo?.property;
        // 
        
        // 
    }

    async referencingAsset<T= Asset>(propertyName:string, asset:T):Promise<SimpleAssetInfo>{
        if(this.info){
            this.info
        }
        return await super.referencingAsset(propertyName, asset)
    }

    async analysisAsset<T= Asset>(propertyName:string, asset:T):Promise<SimpleAssetInfo>{
        const simpleAssetInfo:SimpleAssetInfo = await super.analysisAsset(propertyName, asset);

        return simpleAssetInfo
    }

}


@ccclass('ReferenceComponent')
@executeInEditMode(true)
export class ReferenceComponent extends Parasitify(Component) {
    @property({type:[ReferenceInfoView], readonly:true})
    references:ReferenceInfoView[] = []


    @property
    test:string = ''
    // @override
    // protected async referencingAsset(propertyName:string, simpleAssetInfo:SimpleAssetInfo){      
    //     if(EDITOR){
    //         if(!simpleAssetInfo){
    //             log('delete !!!')
    //             this.assetStores.has(propertyName) && this.assetStores.delete(propertyName);
                
    //         }else{
    //             const assetInfo = await globalThis.Editor.Message.request('asset-db', 'query-asset-info', simpleAssetInfo.uuid);
    //             // log(propertyName + '--------------' + this.data.has(propertyName))
    //         }            
    //     }
    //     await this.super['referencingAsset'](propertyName, simpleAssetInfo);
    // }

    // @override
    // protected async simplifyAsset(propertyName:string, asset:Asset){        
    //     if(asset && js.isChildClassOf(asset.constructor, Prefab)){
    //         // log('---------------------');
    //         if(!this.assetStores.has(propertyName)){
    //             this.assetStores.set(propertyName, Object.create(null));
    //         }
    //         const propertyData:PropertyData = this.assetStores.get(propertyName);
    //         let allPrefabComponents:Component[] = ((asset as Prefab).data as Node).getComponentsInChildren(Component);
    //         allPrefabComponents = allPrefabComponents.map((comp:Component)=>{
    //             const isRefComp:boolean = hadInjectorImplemented(comp.constructor as Constructor, 'Referencify');
    //             if(isRefComp){
    //                 const nodePath:string = comp.node.getPathInHierarchy();
    //                 const compName:string = js.getClassName(comp);
    //                 // 
    //                 const loadedPropertyNames:string[] = Array.from(Decoratify(comp).keys('@reference'));
    //                 loadedPropertyNames.forEach((propName:string)=>{
    //                     const propertyName:string = propName;                          
    //                     if(propertyName){
    //                         const propField:PropertyField = Object.create(null);
    //                         propField.comp = compName;
    //                         propField.property = propertyName;
    //                         propField.node = nodePath;
    //                         const key:string = this.genAssetKey(propField.node, propField.comp, propField.property);
    //                         propertyData[key] = propField;
    //                     }
    //                 })
    //             }
    //             return isRefComp ? comp : null;
    //         })

    //     }
    //     return await this.super['simplifyAsset'](propertyName, asset);
    // }
    
    /**
     * 
     * @param propField 
     * @returns 
     */
    // protected genAssetKey(...props:string[]):string{        
    //     return props.reduce((value:string, currentValue:string)=> value + Support.tokenize(currentValue) + '.', '');
    // }

    /**
     * 
     */
    protected onLoad(): void {
        if(hadInjectorImplemented(this.host.constructor as Constructor, 'Referencify')){
            this.references = [];
            const loadedPropertyNames:string[] = Array.from(Decoratify(this.host).keys('@reference'));            
            loadedPropertyNames.forEach((propName:string)=>{
                const assetInfo:SimpleAssetInfo = this.host[INFO_PROPERTY_PREFIX + propName];
                if(assetInfo && js.isChildClassOf(js.getClassByName(assetInfo.type), Prefab) && (assetInfo as PrefabInfo).references && (assetInfo as PrefabInfo).references.length){
                    const prefabInfo:PrefabInfo = assetInfo as PrefabInfo;
                    prefabInfo.references && prefabInfo.references.forEach((refInfo:ReferenceInfo)=>{
                        //   
                        if(EDITOR){
                            const refInfoView:ReferenceInfoView = new ReferenceInfoView(refInfo, assetInfo.type)
                            CCClass["Attr"].setClassAttr(refInfoView, 'value', 'displayName', refInfo?.property);
                            this.references.push(refInfoView);
                            // CCClass["Attr"].setClassAttr(this, 'test', 'displayName', refInfo?.property);
                            // CCClass["Attr"].setClassAttr(this, 'test', 'default', assetInfo.type);
                        }
                    })
                }
            })
        }
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


