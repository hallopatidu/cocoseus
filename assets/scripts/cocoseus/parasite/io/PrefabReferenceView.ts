import { __private, _decorator, Asset, CCClass, CCObject, Component, Constructor, Eventify, js, log, Node, Prefab } from 'cc';
import Parasitify, { override } from '../../core/Parasitify';
import { hadInjectorImplemented } from '../../core/Inheritancify';
import Decoratify from '../../core/Decoratify';
// import Referencify, { ENUM_PROPERTY_PREFIX, INFO_PROPERTY_PREFIX, PrefabInfo, reference, WRAPPER_PROPERTY_PREFIX } from '../../core/Referencify';
// import { SimpleAssetInfo } from '../../utils/CCEditor';
import { EmbedAsset, IReferencified, PrefabInfo, ReferenceInfo, SimpleAssetInfo } from '../../types/CoreType';
import { EDITOR } from 'cc/env';
import { Support } from '../../utils/Support';
import { cocoseus } from '../..';
import { ENUM_PROPERTY_PREFIX, INFO_PROPERTY_PREFIX, WRAPPER_PROPERTY_PREFIX } from '../../core/PropertyLoadify';
const { ccclass, property, executeInEditMode } = _decorator;


// const SimpleAssetInfoClassToken:number = Support.tokenize.apply(Support, ['bundle','name','type','url','uuid'].sort())
// const PrefabInfoClassToken:number = Support.tokenize.apply(Support, ['bundle','name','references','type','url','uuid'].sort());

/**
 * 
 */
@ccclass('ReferenceProperty')
@cocoseus.propertyDynamicLoading
class ReferenceProperty extends Eventify(CCObject)  {

    static EVENT = {
        UPDATE:'ReferenceInfoView.UPDATE_ASSET_EVENT'
    }

    /**
     * 
     * @param propertyName 
     * @param info 
     * @returns 
     */
    static getTokenFrom(propertyName:string, info:ReferenceInfo):number{
        return Support.tokenize((propertyName ? Support.tokenize(propertyName) + '.' : '') + 
                (info?.node ? Support.pathToToken(info?.node) + '.' : '') +
                (info?.comp ? Support.tokenize(info?.comp) + '.'  : '') + 
                (info?.id ? Support.tokenize(info?.id?.toString()) : '0')+
                (info?.property ? Support.tokenize(info?.property?.toString()) : ''));        
    }

    /**
     * 
     * @param asset 
     * @returns 
     */
    static isEmbedAsset(asset:SimpleAssetInfo|EmbedAsset):Boolean{
        // return asset && !!asset?.constructor;
        const assetConstructor:Constructor<Asset> = asset?.constructor as Constructor<Asset> ;
        return assetConstructor ? (js.isChildClassOf(assetConstructor, Asset) || js.isChildClassOf(assetConstructor, Node) || js.isChildClassOf(assetConstructor, Component)) : false;
    }

    @property({readonly:true})
    component:string = '';

    @property({
        type:Asset,
        visible:false
    })
    value:Asset|Node|Component = null;
    
    private info:ReferenceInfo = null;
    private _token:number = -1;
    /**
     * 
     * @param refInfo 
     */
    constructor(propertyName:string, refInfo?:ReferenceInfo){        
        super();
        this.setData(propertyName, refInfo);        
        // 
    }

    /**
     * 
     * @param propertyName 
     * @param refInfo 
     */
    setData(propertyName:string, refInfo?:ReferenceInfo){
        if(refInfo){
            this._token = ReferenceProperty.getTokenFrom(propertyName, refInfo);
            this.info = refInfo;
            this.component = refInfo?.comp + '<' + refInfo?.node + '>';
            // 
            this.updatePropertyEditorView();
        }
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
    updateAssetInfo(assetOrInfo:SimpleAssetInfo|EmbedAsset){
        if(ReferenceProperty.isEmbedAsset(assetOrInfo)){
            this[INFO_PROPERTY_PREFIX + 'value'] = null;
            this[WRAPPER_PROPERTY_PREFIX + 'value'] = assetOrInfo as unknown as EmbedAsset;
        }else{
            this[INFO_PROPERTY_PREFIX + 'value'] = assetOrInfo as SimpleAssetInfo;            
            this[WRAPPER_PROPERTY_PREFIX + 'value'];    // Call get function to update view.  
        }        
    }

    /**
     * 
     * @param propertyName 
     */
    async onEditorAssetChanged(propertyName:string){
        if(!!this.value){
            (this as unknown as __private._cocos_core_event_eventify__IEventified).emit(ReferenceProperty.EVENT.UPDATE, propertyName, this.token, this.value, true);
        }else{
            (this as unknown as __private._cocos_core_event_eventify__IEventified).emit(ReferenceProperty.EVENT.UPDATE, propertyName, this.token, this[INFO_PROPERTY_PREFIX + 'value'], false);
        }
    }

    get token():number{
        return this._token
    }

}

type AssetInfoValue = {
    [n:number]:SimpleAssetInfo|EmbedAsset
}


/**
 * Một dạng Parasitify Component, có chức năng đọc các property dạng @reference của Component trước nó, tìm ra các tham chiếu tới một hoặc nhiều Prefab (dạng load động hoặc dạng nhúng)
 * Có thể thay đổi tham số truyền vào của các @reference property của các Component bên trong Prefab (ví dụ: thay spriteframe, asset, node ...).
 * Thường được sử dụng để thay giao diện của các Prefab dùng chung.
 */
@ccclass('PrefabReferenceView')
@executeInEditMode(true)
export class PrefabReferenceView extends Parasitify(Component) {
    @property({type:[ReferenceProperty], readonly:true})
    referenceProperties:ReferenceProperty[] = []

    @property({serializable:true, visible:false})
    savedAssetInfos:AssetInfoValue = {};

    @property({serializable:true, visible:false})
    private propertyAsset:{[n:string]:number[]} = js.createMap(null);

    /**
     * Hàm thực thi khi các giá trị tham chiếu trong các @reference property của host được load hoặc được khởi tạo thành công.
     * @param propertyName 
     * @param asset 
     */
    @override
    async onLoadedAsset(propertyName:string, asset:Asset){
        if(asset && js.isChildClassOf(asset.constructor, Prefab)){
            // 
            let allPrefabComponents:Component[] = ((asset as Prefab).data as Node).getComponentsInChildren(Component);
            allPrefabComponents.forEach((comp:Component)=>{                
                const refInfos:ReferenceInfo[] = this.super['getChildReferenceInfo'](comp)
                refInfos.forEach((refInfo:ReferenceInfo)=>{
                    const refToken:number = ReferenceProperty.getTokenFrom(propertyName, refInfo);
                    const propArr:string[] = refInfo?.property?.split("::");
                    const compPropertyName:string = propArr[0];
                    const assetOrInfo:SimpleAssetInfo|EmbedAsset = this.savedAssetInfos[refToken]
                    if(assetOrInfo){
                        comp[INFO_PROPERTY_PREFIX + compPropertyName] = null;
                        // log('Has ref info :: ' + propertyName + ' --- ' +refToken + " :: " + JSON.stringify(refInfo));  
                        if(ReferenceProperty.isEmbedAsset(assetOrInfo)){
                            comp[compPropertyName] = assetOrInfo;
                        }else{
                            comp[INFO_PROPERTY_PREFIX + compPropertyName] = assetOrInfo;
                        }
                    }else{
                        log('No infomation !!! ')
                    }
                })                
            })
            // }
        }
    }

    /**
     * Hàm chỉ chạy trong Editor. onEditorAssetChanged được gọi khi có thay đổi giá trị trong các @reference property của host
     * @param propertyName 
     */
    @override
    async onEditorAssetChanged(propertyName:string){
        if(EDITOR){
            this.updateReferenceView();
        }
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
     * Hiển thị các ReferenceInfo dưới dạng Component để thuận tiện cho việc sử dụng.
     */
    private updateReferenceView(){
        if(EDITOR){
            if(hadInjectorImplemented(this.host.constructor as Constructor, 'Referencify')){
                //  Clear view.
                this.referenceProperties = [];
                const loadedPropertyNames:string[] = Array.from(Decoratify(this.host).keys('@reference'));            
                loadedPropertyNames.forEach((propName:string)=>{    
                    const propArr:string[] = propName?.split("::");                                       
                    if(propArr && propArr.length){                        
                        const propertyName:string = propArr[0];
                        const isEmbed:boolean = !!this.host[propertyName];
                        isEmbed ? this.updateEmbedProperty(propertyName) : this.updateLoadingProperty(propertyName);
                    }
                });
                // 
                this.referenceProperties.forEach((refView:ReferenceProperty)=>{
                    refView.updatePropertyEditorView()
                })
                // this.saveAndRefresh_Editor();
            }
        }
    }

    // -----------------------------

    /**
     * Hàm được gọi khi giá trị tham chiếu của một @reference property (của host) đang ở dạng lưu trực tiếp vào file.scene.
     * 
     * @param propertyName 
     */
    private updateEmbedProperty(propertyName:string){
        if(propertyName){
            const asset:EmbedAsset = this.host[propertyName]
            if(asset && js.isChildClassOf(asset.constructor, Prefab)){
                // 
                let allPrefabComponents:Component[] = ((asset as Prefab).data as Node).getComponentsInChildren(Component);
                allPrefabComponents.forEach((comp:Component)=>{
                    const refInfos:ReferenceInfo[] = this.super['getChildReferenceInfo'](comp);
                    refInfos.forEach((refInfo:ReferenceInfo)=>this.createOrUpdateReferenceInfoView(propertyName, refInfo))
                })
                // 
            }
            // 
        }
    }

    /**
     * Hàm được gọi khi giá trị tham chiếu của một @reference property (của host) đang ở dạng phải tiến hành việc loading.
     * @param propertyName 
     */
    private updateLoadingProperty(propertyName:string){
        if(propertyName){
            //          
            // Lay asset info tu host tương ứng thuộc tính
            const assetInfo:SimpleAssetInfo = this.host[INFO_PROPERTY_PREFIX + propertyName];            
            if(!!assetInfo && js.isChildClassOf(js.getClassByName(assetInfo.type), Prefab) &&
            (assetInfo as PrefabInfo).references && (assetInfo as PrefabInfo).references.length){
                // Nêu đó là Prefab và có asset info thì là prefab phải load va đã có ref trong assetInfo,                
                const prefabInfo:PrefabInfo = assetInfo as PrefabInfo;
                // Phân tích mảng reference info để gắn skin tương ướng component và thuộc tính.
                // Cập nhật view.
                prefabInfo.references.forEach((refInfo:ReferenceInfo)=>this.createOrUpdateReferenceInfoView(propertyName, refInfo));
            }
        }
    }

    /**
     * Tạo ra phần tử hiển thị một ReferenceInfo. 
     * @param propertyName 
     * @param refInfo 
     */
    private createOrUpdateReferenceInfoView(propertyName:string, refInfo:ReferenceInfo){
        if(refInfo){
            // const propertyToken:number = Support.tokenize(propertyName);
            const refInfoView:ReferenceProperty = new ReferenceProperty(propertyName, refInfo);
            const token:number = refInfoView.token;
            (refInfoView as unknown as __private._cocos_core_event_eventify__IEventified).on(ReferenceProperty.EVENT.UPDATE, this.saveAsset.bind(this));
            // 
            if(this.savedAssetInfos[token]){
                refInfoView.updateAssetInfo(this.savedAssetInfos[token]);
            }
            this.referenceProperties.push(refInfoView);
        }
    }


    /**
     * 
     * @param propertyName 
     * @param refToken 
     */
    private addPropertyReference(propertyName:string, refToken:number, assetInfo:SimpleAssetInfo|EmbedAsset){
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
     * Lưu thay đổi của một @reference property xuất phát từ ReferenceView
     * @param assetInfo 
     */
    protected saveAsset(propertyName:string, token:number, assetInfo:SimpleAssetInfo|EmbedAsset){
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
        if(this.referenceProperties && this.referenceProperties.length){
            this.referenceProperties.forEach((refInfoView:ReferenceProperty)=>{
                (refInfoView as unknown as __private._cocos_core_event_eventify__IEventified).off(ReferenceProperty.EVENT.UPDATE, this.saveAsset);
            })
        }        
    }

    // protected onLoad(): void {        
    
    // }

    
}


