import { __private, _decorator, Asset, CCClass, CCObject, Component, Constructor, Eventify, js, log, Node, Prefab } from 'cc';
import Parasitify, { override } from '../core/Parasitify';
import { hadInjectorImplemented } from '../core/Inheritancify';
import Decoratify from '../core/Decoratify';
import Referencify, { ENUM_PROPERTY_PREFIX, INFO_PROPERTY_PREFIX, PrefabInfo, reference, WRAPPER_PROPERTY_PREFIX } from '../core/Referencify';
import { CCEditor, SimpleAssetInfo } from '../utils/CCEditor';
import { IReferencified, ReferenceInfo } from '../types/CoreType';
import { EDITOR } from 'cc/env';
import { Support } from '../utils/Support';
const { ccclass, property, executeInEditMode } = _decorator;

const SimpleAssetInfoClassToken:number = Support.tokenize('bundle','name','type','url','uuid');
const PrefabInfoClassToken:number = Support.tokenize('bundle','name','references','type','url','uuid');

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

    @reference({
        displayName:'__',
        type:Asset
    })
    value:Asset|Node|Component = null;
    
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
            this.updatePropertyEditorView();
        }
        
        // 
    }

    /**
     * 
     */
    updatePropertyEditorView(){
        if(this.info){
            const propArr:string[] = this.info?.property?.split("::");
            const propertyName:string = propArr[0];
            const classType:string = propArr[1];              
            classType && CCClass["Attr"].setClassAttr(this, WRAPPER_PROPERTY_PREFIX + 'value', 'type', 'Object');      
            classType && CCClass["Attr"].setClassAttr(this, WRAPPER_PROPERTY_PREFIX + 'value', 'ctor', js.getClassByName(classType));  
            propertyName && CCClass["Attr"].setClassAttr(this, WRAPPER_PROPERTY_PREFIX + 'value', 'displayName', propertyName);    
            propertyName && CCClass["Attr"].setClassAttr(this, ENUM_PROPERTY_PREFIX + 'value', 'displayName', propertyName);    
        }
    }

    /**
     * 
     * @param assetOrInfo 
     */
    recordAssetInfo(assetOrInfo:SimpleAssetInfo|Asset|Component|Node){
        if(js.isChildClassOf(assetOrInfo, Asset) ||
        js.isChildClassOf(assetOrInfo, Node) ||
        js.isChildClassOf(assetOrInfo, Component)){
            this[WRAPPER_PROPERTY_PREFIX + 'value'] = assetOrInfo as unknown as Asset|Component|Node;
        }else{
            this[INFO_PROPERTY_PREFIX + 'value'] = assetOrInfo;
            this[WRAPPER_PROPERTY_PREFIX + 'value'];    // Call to update view.  
        }
    }

    isAssetInfo(asset:Asset|Component|Node):boolean{
        const classType:any = asset.constructor || asset;
        return !js.isChildClassOf(classType, Asset)
    }


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

    
    @override
    async onLoadedAsset(propertyName:string, asset:Asset){
        if(asset && js.isChildClassOf(asset.constructor, Prefab)){
            const hostToken:number = (this.host as IReferencified).token;
            const parentKey:string = hostToken + '.' + Support.tokenize(propertyName);
            // 
            let allPrefabComponents:Component[] = ((asset as Prefab).data as Node).getComponentsInChildren(Component);
            allPrefabComponents.forEach((comp:Component)=>{                
                const refInfos:ReferenceInfo[] = this.super['getChildReferenceInfo'](comp)
                refInfos.forEach((refInfo:ReferenceInfo)=>{
                    const refToken:number = ReferenceInfoView.getTokenFrom(parentKey, refInfo);
                    if(this.savedAssetInfos[refToken]){
                        // log('Has ref info :: ' + propertyName + ' --- ' +refToken + " :: " + JSON.stringify(refInfo));
                        const propArr:string[] = refInfo?.property?.split("::");
                        const compPropertyName:string = propArr[0];
                        comp[INFO_PROPERTY_PREFIX + compPropertyName] = this.savedAssetInfos[refToken]
                    }else{
                        log('No infomation !!! ')
                    }
                })                
            })
            // }
        }
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
                this.referenceViews.forEach((refView:ReferenceInfoView)=>{
                    refView.updatePropertyEditorView()
                })
                // this.saveAndRefresh_Editor();
            }
        }
    }

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
    private addPropertyReference(propertyName:string, refToken:number, assetInfo?:SimpleAssetInfo|Asset){
        const refTokens:number[] = (this.propertyAsset[propertyName] ??= []);
        (refTokens.indexOf(refToken) == -1) && refTokens.push(refToken);
        if(!!assetInfo){
            this.savedAssetInfos[refToken] = assetInfo;
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
    
    // }

    
}


