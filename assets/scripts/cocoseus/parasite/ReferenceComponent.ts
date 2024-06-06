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
        // (this as unknown as __private._cocos_core_event_eventify__IEventified).emit(ReferenceInfoView.EVENT.UPDATE, this.token, assetInfo);
    }

    // async referencingAsset<T= Asset>(propertyName:string, asset:T):Promise<SimpleAssetInfo>{
    //     if(this.info){
    //         this.info
    //     }
    //     return await super.referencingAsset(propertyName, asset)
    // }

    async analysisAsset<T= Asset>(propertyName:string, asset:T):Promise<SimpleAssetInfo>{
        const simpleAssetInfo:SimpleAssetInfo = await super.analysisAsset(propertyName, asset);
        (this as unknown as __private._cocos_core_event_eventify__IEventified).emit(ReferenceInfoView.EVENT.UPDATE, this.token, simpleAssetInfo);
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
    savedAssetInfos:AssetInfoValue = {};

    private editedAsset:Set<string> = new Set();

    @property({serializable:true, visible:false})
    private propertyAsset:{[n:string]:number[]} = js.createMap(null);
    

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
                        const propName:string = refInfo.property;                         
                        const propArr:string[] = propName?.split("::");    
                        const childPropertyName:string = propArr[0];
                        const token:number = ReferenceInfoView.getTokenFrom(parentKey, refInfo);
                        const newAssetInfo:SimpleAssetInfo = this.savedAssetInfos[token];
                        comp[INFO_PROPERTY_PREFIX + childPropertyName] = newAssetInfo;
                        log(token + '---------' + JSON.stringify(this.savedAssetInfos))
                    })
                }
            })
            this.editedAsset.add(propertyName);
        }
    }

    @override
    async analysisAsset<T= Asset>(propertyName:string, asset:T):Promise<SimpleAssetInfo>{
        EDITOR && this.updateReferenceView()
        return await this.super['analysisAsset'](propertyName, asset);
    }
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
            this.updateReferenceView()
        }else{

        }
    }

    /**
     * 
     */
    private updateReferenceView(){
        if(EDITOR){
            if(hadInjectorImplemented(this.host.constructor as Constructor, 'Referencify')){
                this.referenceViews = [];
                const hostToken:number = (this.host as IReferencified).token;
                const loadedPropertyNames:string[] = Array.from(Decoratify(this.host).keys('@reference'));            
                loadedPropertyNames.forEach((propName:string)=>{    
                    const propArr:string[] = propName?.split("::");                                       
                    if(propArr && propArr.length){
                        const propertyName:string = propArr[0];                        
                        if(propertyName){
                            const assetInfo:SimpleAssetInfo = this.host[INFO_PROPERTY_PREFIX + propertyName];
                            const parentKey:string = hostToken + '.' + Support.tokenize(propertyName);
                            if(!!assetInfo && js.isChildClassOf(js.getClassByName(assetInfo.type), Prefab) && (assetInfo as PrefabInfo).references && (assetInfo as PrefabInfo).references.length){
                                const prefabInfo:PrefabInfo = assetInfo as PrefabInfo;
                                prefabInfo.references && prefabInfo.references.forEach((refInfo:ReferenceInfo)=>{                                
                                    const refInfoView:ReferenceInfoView = new ReferenceInfoView(parentKey, refInfo);
                                    const token:number = refInfoView.token;
                                    this.referenceViews.push(refInfoView);
                                    this.addRefToken(propertyName, token);
                                    (refInfoView as unknown as __private._cocos_core_event_eventify__IEventified).on(ReferenceInfoView.EVENT.UPDATE, this.updateAsset.bind(this, propertyName));
                                    // 
                                    if(this.savedAssetInfos[token]){
                                        refInfoView.updateAsset(this.savedAssetInfos[token]);
                                    }
                                    // 
                                })
                            }
                        }
                    }
                })
            }
        }
    }

    /**
     * 
     * @param propertyName 
     * @param token 
     */
    private addRefToken(propertyName:string, token:number){
        const refTokens:number[] = (this.propertyAsset[propertyName] ??= []);
        (refTokens.indexOf(token) == -1) && refTokens.push(token);
    }

    /**
     * 
     * @param propertyName 
     */
    private deleteProperty(propertyName:string){
        const refTokens:number[] = (this.propertyAsset[propertyName] ??= []);
        refTokens.forEach((token:number)=>{
            delete this.savedAssetInfos[token];
        })
        delete this.propertyAsset[propertyName];
    }

    /**
     * 
     * @param assetInfo 
     */
    protected updateAsset(propertyName:string, token:number, assetInfo:SimpleAssetInfo){
        this.savedAssetInfos[token] = assetInfo;
        this.addRefToken(propertyName, token);
    }


    /**
     * 
     */
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


