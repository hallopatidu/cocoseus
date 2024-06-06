import { __private, _decorator, Asset, CCClass, CCObject, Component, Constructor, Eventify, js, log, Node, Prefab } from 'cc';
import Parasitify, { override } from '../core/Parasitify';
import { hadInjectorImplemented } from '../core/Inheritancify';
import Decoratify from '../core/Decoratify';
import Referencify, { INFO_PROPERTY_PREFIX, PrefabInfo, reference, WRAPPER_PROPERTY_PREFIX } from '../core/Referencify';
import { CCEditor, SimpleAssetInfo } from '../utils/CCEditor';
import { IReferencified, ReferenceInfo } from '../types/CoreType';
import { EDITOR } from 'cc/env';
import { Support } from '../utils/Support';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('ReferenceInfoView')
class ReferenceInfoView extends Referencify<IReferencified&__private._cocos_core_event_eventify__IEventified>(Eventify(CCObject))  {

    static EVENT = {
        UPDATE:'ReferenceInfoView.UPDATE_ASSET_EVENT'
    }

    /**
     * 
     * @param parentKey 
     * @param info 
     * @returns 
     */
    static getTokenFrom(parentKey:string, info:ReferenceInfo):number{
        return Support.tokenize((parentKey ? Support.tokenize(parentKey) + '.' : '') + 
                (info?.node ? Support.pathToToken(info?.node) + '.' : '') +
                (info?.comp ? Support.tokenize(info?.comp) + '.'  : '') + 
                (info?.id ? Support.tokenize(info?.id?.toString()) : '0')+
                (info?.property ? Support.tokenize(info?.property?.toString()) : ''));        
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
        (this as unknown as __private._cocos_core_event_eventify__IEventified).emit(ReferenceInfoView.EVENT.UPDATE, this.token, assetInfo);
    }

    // async referencingAsset<T= Asset>(propertyName:string, asset:T):Promise<SimpleAssetInfo>{
    //     if(this.info){
    //         this.info
    //     }
    //     return await super.referencingAsset(propertyName, asset)
    // }

    async analysisAsset<T= Asset>(propertyName:string, asset:T):Promise<SimpleAssetInfo>{
        const simpleAssetInfo:SimpleAssetInfo = await super.analysisAsset(propertyName, asset);
        // (this as unknown as __private._cocos_core_event_eventify__IEventified).emit(ReferenceInfoView.EVENT.UPDATE, this.token, simpleAssetInfo);
        return simpleAssetInfo
    }

    get refInfo():ReferenceInfo{
        if(this.info && !this.info.root){
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

    private editedAsset:Set<string> = new Set();
    

    @override
    async referencingAsset(propertyName:string, asset:Asset){
        if(!EDITOR && !this.editedAsset.has(propertyName) && asset && js.isChildClassOf(asset.constructor, Prefab) &&
        this.super && this.super['getChildReferenceInfo'] && this.super[propertyName] ){
            // 
            const hostToken:number = (this.host as IReferencified).token;
            const parentKey:string = hostToken + '.' + Support.tokenize(propertyName);
            const prefabAsset:Prefab = asset as Prefab;
            // const refInfos:ReferenceInfo[] = []
            const comps:Component[] = (prefabAsset?.data as Node).getComponentsInChildren(Component);
            comps.forEach((comp:Component)=>{
                const hasInjector:boolean = hadInjectorImplemented(comp.constructor as Constructor, 'Referencify')
                if(hasInjector){
                    let childRefInfos:ReferenceInfo[] = this.super['getChildReferenceInfo'](comp);
                    childRefInfos.forEach((refInfo:ReferenceInfo)=>{
                        const token:number = ReferenceInfoView.getTokenFrom(parentKey, refInfo);
                        const newAssetInfo:SimpleAssetInfo = this.assetInfos[token];
                        comp[INFO_PROPERTY_PREFIX + propertyName] = newAssetInfo;
                        log('---------')
                    })
                }
            })


            this.editedAsset.add(propertyName);
        }
    }

    // @override
    // async loadEachAsset(propertyRecord:string, assetInfo:SimpleAssetInfo):Promise<Asset>{        
    //     const loadedAsset:Asset = await this.super['loadEachAsset'](propertyRecord, assetInfo) as Asset;
    //     if(!EDITOR && loadedAsset && js.isChildClassOf(loadedAsset.constructor, Prefab)){
    //         log('-----------------------');
    //         const simpleAssetInfo:SimpleAssetInfo = await CCEditor.getSimpleAssetInfo(loadedAsset);

    //         const prefabInfo:PrefabInfo = assetInfo as PrefabInfo;


    //         const prefabAsset:Prefab = loadedAsset as Prefab;
    //         const propArr:string[] = propertyRecord?.split("::");  
            
    //         if(propArr && propArr.length){                
    //             const propertyName:string = propArr[0];
    //             // const classType:string = propArr[1];
    //             const hostToken:number = (this.host as IReferencified).token;
    //             const parentKey:string = hostToken + '.' + Support.tokenize(propertyName);
    //             const comps:Component[] = prefabAsset?.data.getComponentsInChildren(Component);
    //             comps.forEach((comp:Component)=>{
    //                 if(hadInjectorImplemented(comp.constructor as Constructor, 'Referencify')){
    //                     Referencify(comp)
    //                 }

    //             })

    //         }
    //     }
    //     // 
    //     return loadedAsset
    // }
    
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
                        if(propertyName){
                            // 
                            const assetInfo:SimpleAssetInfo = this.host[INFO_PROPERTY_PREFIX + propertyName];
                            const parentKey:string = hostToken + '.' + Support.tokenize(propertyName);
                            if(!!assetInfo && js.isChildClassOf(js.getClassByName(assetInfo.type), Prefab) && (assetInfo as PrefabInfo).references && (assetInfo as PrefabInfo).references.length){
                                const prefabInfo:PrefabInfo = assetInfo as PrefabInfo;
                                prefabInfo.references && prefabInfo.references.forEach((refInfo:ReferenceInfo)=>{                                
                                    const refInfoView:ReferenceInfoView = new ReferenceInfoView(parentKey, refInfo);
                                    this.referenceViews.push(refInfoView);
                                    (refInfoView as unknown as __private._cocos_core_event_eventify__IEventified).on(ReferenceInfoView.EVENT.UPDATE, this.updateAsset.bind(this));   
                                    if(this.assetInfos[refInfoView.token]){
                                        refInfoView.updateAsset(this.assetInfos[refInfoView.token]);
                                    }
                                })
                            }
                        }
                    }                    
                })
            }
        }else{

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
                (refInfoView as unknown as __private._cocos_core_event_eventify__IEventified).off(ReferenceInfoView.EVENT.UPDATE, this.updateAsset);
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


