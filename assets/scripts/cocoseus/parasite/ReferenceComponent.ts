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
    constructor(parentKey:string, refInfo?:ReferenceInfo){        
        super();
        this.parentKey = parentKey;
        if(refInfo){
            this.info = refInfo;
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

    /**
     * 
     * @param assetInfo 
     */
    recordAssetInfo(assetInfo:SimpleAssetInfo){
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

    /**
     * 
     * @param propertyName 
     * @param asset 
     * @returns 
     */
    async analysisAsset<T= Asset>(propertyName:string, asset:T):Promise<SimpleAssetInfo>{
        const simpleAssetInfo:SimpleAssetInfo = await super.analysisAsset(propertyName, asset);
        const boardcastAsset:SimpleAssetInfo|Asset = simpleAssetInfo ? simpleAssetInfo : asset;
        (this as unknown as __private._cocos_core_event_eventify__IEventified).emit(ReferenceInfoView.EVENT.UPDATE, propertyName, this.token, boardcastAsset);
        return simpleAssetInfo;
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
    [n:number]:SimpleAssetInfo|Asset
}

@ccclass('ReferenceComponent')
@executeInEditMode(true)
export class ReferenceComponent extends Parasitify(Component) {
    @property({type:[ReferenceInfoView], readonly:true})
    referenceViews:ReferenceInfoView[] = []

    @property({serializable:true, visible:false})
    savedAssetInfos:AssetInfoValue = {};

    @property({serializable:true, visible:false})
    private propertyAsset:{[n:string]:number[]} = js.createMap(null);

    // @property({serializable:true, visible:false})
    // private _saveState:number = -1;

    // @override
    // async referencingAsset(propertyName:string, asset:Asset){
    //     if(!EDITOR && !this.editedAsset.has(propertyName) && asset && js.isChildClassOf(asset.constructor, Prefab) &&
    //     this.super && this.super['getChildReferenceInfo'] && this.super[propertyName] ){
    //         // 
    //         const hostToken:number = (this.host as IReferencified).token;
    //         const parentKey:string = hostToken + '.' + Support.tokenize(propertyName);
    //         const prefabAsset:Prefab = asset as Prefab;
    //         // const refInfos:ReferenceInfo[] = []
    //         const comps:Component[] = (prefabAsset?.data as Node).getComponentsInChildren(Component);
    //         comps.forEach((comp:Component)=>{
    //             const hasInjector:boolean = hadInjectorImplemented(comp.constructor as Constructor, 'Referencify')
    //             if(hasInjector){
    //                 let childRefInfos:ReferenceInfo[] = this.super['getChildReferenceInfo'](comp);
    //                 childRefInfos.forEach((refInfo:ReferenceInfo)=>{
    //                     const propName:string = refInfo.property;                         
    //                     const propArr:string[] = propName?.split("::");    
    //                     const childPropertyName:string = propArr[0];
    //                     const token:number = ReferenceInfoView.getTokenFrom(parentKey, refInfo);
    //                     const newAssetInfo:SimpleAssetInfo = this.savedAssetInfos[token];
    //                     comp[INFO_PROPERTY_PREFIX + childPropertyName] = newAssetInfo;
    //                     log(token + '---------' + JSON.stringify(this.savedAssetInfos))
    //                 })
    //             }
    //         })
    //         this.editedAsset.add(propertyName);
    //     }
    // }

    // @override
    // async analysisAsset<T= Asset>(propertyName:string, asset:T):Promise<SimpleAssetInfo>{
    //     const simpleAssetInfo:SimpleAssetInfo = await this.super['analysisAsset'](propertyName, asset);

    //     EDITOR && this.updateReferenceView()
    //     return simpleAssetInfo;
    // }
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

    @override
    async onLoadedAsset(propertyName:string, asset:Asset){
        
    }

    @override
    async onEditorAssetChanged(propertyName:string){
        if(EDITOR){
            this.updateReferenceView();
        }
    }
    
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
                //  Clear view.
                this.referenceViews = [];
                const loadedPropertyNames:string[] = Array.from(Decoratify(this.host).keys('@reference'));            
                loadedPropertyNames.forEach((propName:string)=>{    
                    const propArr:string[] = propName?.split("::");                                       
                    if(propArr && propArr.length){
                        const propertyName:string = propArr[0];                         
                        this.displayProperty(propertyName);
                    }
                })
                // 
                // this.saveAndRefresh_Editor();
            }
        }
    }


    // private async saveAndRefresh_Editor(){
    //     if(EDITOR){
    //         const saveToken:number = Support.tokenize(JSON.stringify(this.savedAssetInfos))
    //         const canReload:boolean = (this._saveState !== saveToken)
    //         this._saveState = saveToken;
    //         if(canReload){
    //             log('refresh !!')
    //             await globalThis.Editor.Message.request('scene', 'save-scene');
    //             await globalThis.Editor.Message.request('scene', 'soft-reload')
    //         }
    //     }
    // }

    // -----------------------------
    /**
     * 
     * @param propertyName 
     */
    private displayProperty(propertyName:string){
        if(propertyName){
            // Lay token cua host kêt hop voi property name để tính ra parent token.
            const hostToken:number = (this.host as IReferencified).token;
            const parentKey:string = hostToken + '.' + Support.tokenize(propertyName);
            
            // Lay asset info tu host tương ứng thuộc tính
            const assetInfo:SimpleAssetInfo = this.host[INFO_PROPERTY_PREFIX + propertyName];            
            if(!!assetInfo && js.isChildClassOf(js.getClassByName(assetInfo.type), Prefab) &&
            (assetInfo as PrefabInfo).references && (assetInfo as PrefabInfo).references.length){
                // Nêu đó là Prefab và có asset info thì là prefab phải load va đã có ref trong assetInfo,                
                const prefabInfo:PrefabInfo = assetInfo as PrefabInfo;
                // Phân tích mảng reference info để gắn skin tương ướng component và thuộc tính.
                prefabInfo.references && prefabInfo.references.forEach((refInfo:ReferenceInfo)=>{  
                    const token:number = ReferenceInfoView.getTokenFrom(parentKey, refInfo);                    
                    this.addPropertyReference(propertyName, token);
                    // Cập nhật view 
                    const refInfoView:ReferenceInfoView = new ReferenceInfoView(parentKey, refInfo);
                    this.referenceViews.push(refInfoView);
                    (refInfoView as unknown as __private._cocos_core_event_eventify__IEventified).on(ReferenceInfoView.EVENT.UPDATE, this.saveAsset.bind(this));
                    // 
                    if(this.savedAssetInfos[token]){
                        refInfoView.recordAssetInfo(this.savedAssetInfos[token]);
                    }
                })
            }

        }
    }


    /**
     * 
     * @param propertyName 
     * @param refToken 
     */
    private addPropertyReference(propertyName:string, refToken:number, asset?:SimpleAssetInfo|Asset){
        const refTokens:number[] = (this.propertyAsset[propertyName] ??= []);
        (refTokens.indexOf(refToken) == -1) && refTokens.push(refToken);
        if(!!asset){
            this.savedAssetInfos[refToken] = asset;
        }
    }

    /**
     * 
     * @param propertyName 
     */
    private removePropertyReference(propertyName:string, refToken:number = undefined){
        const refTokens:number[] = (this.propertyAsset[propertyName] ??= []);
        if(refToken !== undefined){
            this.propertyAsset[propertyName] = refTokens.map((token:number)=> token !== refToken ? token : null)
            delete this.savedAssetInfos[refToken];            
        }else{
            refTokens.forEach((token:number)=>{
                delete this.savedAssetInfos[token];
            })
            delete this.propertyAsset[propertyName];
        }
    }

    /**
     * 
     * @param assetInfo 
     */
    protected saveAsset(propertyName:string, token:number, assetInfo:SimpleAssetInfo){
        if(!assetInfo){
            this.removePropertyReference(propertyName, token);
        }else{
            this.addPropertyReference(propertyName, token, assetInfo);
        }
    }


    /**
     * 
     */
    protected onDestroy(): void {
        if(this.referenceViews && this.referenceViews.length){
            this.referenceViews.forEach((refInfoView:ReferenceInfoView)=>{
                (refInfoView as unknown as __private._cocos_core_event_eventify__IEventified).off(ReferenceInfoView.EVENT.UPDATE, this.saveAsset);
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


