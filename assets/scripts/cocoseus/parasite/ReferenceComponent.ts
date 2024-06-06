import { _decorator, Asset, CCClass, CCObject, Component, Constructor, Eventify, js, log, Prefab } from 'cc';
import Parasitify, { override } from '../core/Parasitify';
import { hadInjectorImplemented } from '../core/Inheritancify';
import Decoratify from '../core/Decoratify';
import Referencify, { INFO_PROPERTY_PREFIX, PrefabInfo, reference, WRAPPER_PROPERTY_PREFIX } from '../core/Referencify';
import { SimpleAssetInfo } from '../utils/CCEditor';
import { IReferencified, ReferenceInfo } from '../types/CoreType';
import { EDITOR } from 'cc/env';
import { Support } from '../utils/Support';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('ReferenceInfoView')
class ReferenceInfoView extends Eventify(Referencify(CCObject)) {

    static EVENT = {
        UPDATE:'ReferenceInfoView.UPDATE_ASSET_EVENT'
    }

    // @property({readonly:true})
    // nodePath:string = '';

    @property({readonly:true})
    component:string = ''
    
    // @property({readonly:true})
    // key:string = ''

    @reference({type:Asset})
    value:Asset = null;
    
    private info:ReferenceInfo = null;
    private parentKey:string = '';
    /**
     * 
     * @param refInfo 
     */
    constructor(parentKey:string, refInfo:ReferenceInfo){        
        super();
        if(refInfo){
            this.info = refInfo;
            this.parentKey = parentKey;
            // this.nodePath = refInfo?.node;
            this.component = refInfo?.comp + '<' + refInfo?.node + '>';
            // 
            const propArr:string[] = refInfo?.property?.split("::");
            const propertyName:string = propArr[0];
            const classType:string = propArr[1];                    
            propertyName && CCClass["Attr"].setClassAttr(this, WRAPPER_PROPERTY_PREFIX + 'value', 'displayName', propertyName);      
            classType && CCClass["Attr"].setClassAttr(this, WRAPPER_PROPERTY_PREFIX + 'value', 'type', classType);      
        }
        // 
    }

    updateAsset(assetInfo:SimpleAssetInfo){
        this[INFO_PROPERTY_PREFIX + 'value'] = assetInfo;
        this[WRAPPER_PROPERTY_PREFIX + 'value'];
    }

    // async referencingAsset<T= Asset>(propertyName:string, asset:T):Promise<SimpleAssetInfo>{
    //     if(this.info){
    //         this.info
    //     }
    //     return await super.referencingAsset(propertyName, asset)
    // }

    async analysisAsset<T= Asset>(propertyName:string, asset:T):Promise<SimpleAssetInfo>{
        const simpleAssetInfo:SimpleAssetInfo = await super.analysisAsset(propertyName, asset);
        this.emit(ReferenceInfoView.EVENT.UPDATE, this.token, simpleAssetInfo);
        return simpleAssetInfo
    }

    get refInfo():ReferenceInfo{
        if(this.info){
            this.info.root = this.parentKey;
        }
        return this.info
    }

    get token():number{
        return super.token
    }

}

type AssetInfoValue = {
    [n:number]:SimpleAssetInfo
}

@ccclass('ReferenceComponent')
@executeInEditMode(true)
export class ReferenceComponent extends Parasitify(Component) {
    @property({type:[ReferenceInfoView], readonly:true})
    referenceViews:ReferenceInfoView[] = []


    @property({serializable:true, visible:false})
    assetInfos:AssetInfoValue = {};
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

    @override
    async loadEachAsset(propertyRecord:string, assetInfo:SimpleAssetInfo):Promise<Asset>{
        // 
        return await this.super['loadEachAsset'](propertyRecord, assetInfo) as Asset;
    }
    
    /**
     * 
     * @param propField 
     * @returns 
     */
    protected genAssetKey(...props:string[]):string{        
        return props.reduce((value:string, currentValue:string)=> value + Support.tokenize(currentValue) + '.', '');
    }

    /**
     * 
     */
    protected onLoad(): void {
        if(EDITOR){
            if(hadInjectorImplemented(this.host.constructor as Constructor, 'Referencify')){
                this.referenceViews = [];
                const hostToken:number = (this.host as IReferencified).token;
                const loadedPropertyNames:string[] = Array.from(Decoratify(this.host).keys('@reference'));            
                loadedPropertyNames.forEach((propName:string)=>{    
                    const propArr:string[] = propName?.split("::");                                       
                    if(propArr && propArr.length){
                        const propertyName:string = propArr[0];
                        const classType:string = propArr[1];
                        // 
                        const assetInfo:SimpleAssetInfo = this.host[INFO_PROPERTY_PREFIX + propertyName];
                        const parentKey:string = hostToken + '.' + Support.tokenize(propertyName);
                        if(!!assetInfo && js.isChildClassOf(js.getClassByName(assetInfo.type), Prefab) && (assetInfo as PrefabInfo).references && (assetInfo as PrefabInfo).references.length){
                            const prefabInfo:PrefabInfo = assetInfo as PrefabInfo;
                            prefabInfo.references && prefabInfo.references.forEach((refInfo:ReferenceInfo)=>{                                
                                const refInfoView:ReferenceInfoView = new ReferenceInfoView(parentKey, refInfo);
                                this.referenceViews.push(refInfoView);
                                refInfoView.on(ReferenceInfoView.EVENT.UPDATE, this.updateAsset.bind(this));   
                                if(this.assetInfos[refInfoView.token]){
                                    refInfoView.updateAsset(this.assetInfos[refInfoView.token])
                                }
                            })
                        }
                    }                    
                })
            }
        }
    }

    /**
     * 
     * @param assetInfo 
     */
    protected updateAsset(token:number, assetInfo:SimpleAssetInfo){
        this.assetInfos[token] = assetInfo;
    }


    protected onDestroy(): void {
        if(this.referenceViews && this.referenceViews.length){
            this.referenceViews.forEach((refInfoView:ReferenceInfoView)=>{
                refInfoView.on(ReferenceInfoView.EVENT.UPDATE, this.updateAsset);
            })
        }
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


