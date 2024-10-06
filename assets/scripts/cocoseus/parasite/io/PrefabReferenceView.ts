import { __private, _decorator, Asset, CCClass, CCObject, Component, Constructor, Eventify, js, log, Node, Prefab, warn } from 'cc';
import Parasitify, { override } from '../../core/Parasitify';
import { EmbedAsset, PrefabInfo, ReferenceInfo, SimpleAssetInfo } from '../../types/CoreType';
import { DEV, EDITOR } from 'cc/env';
import { Support } from '../../utils/Support';
import { ENUM_PROPERTY_PREFIX, INFO_PROPERTY_PREFIX, PropertyLoadifyDecorator, PropertyLoadifyInjector, WRAPPER_PROPERTY_PREFIX } from '../../core/PropertyLoadify';
import { cocoseus } from '../../plugins';
import { CCEditor } from '../../utils/CCEditor';
import { hadInjectorImplemented } from '../../core/Inheritancify';
import PropertyExportify, { PropertyExportifyDecorator, PropertyExportifyInjector } from '../../core/PropertyExportify';

const { ccclass, property, executeInEditMode } = _decorator;

type AssetInfoValue = {
    [n:number]:SimpleAssetInfo|EmbedAsset
}
// const SimpleAssetInfoClassToken:number = Support.tokenize.apply(Support, ['bundle','name','type','url','uuid'].sort())
// const PrefabInfoClassToken:number = Support.tokenize.apply(Support, ['bundle','name','references','type','url','uuid'].sort());

/**
 * 
 */
@ccclass('ReferenceProperty')
@cocoseus.propertyDynamicLoading
// @cocoseus.eventEmitter
class ReferenceProperty extends Eventify( CCObject) {

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
    // constructor(){        
    //     super();
    //     // this.setData(propertyName, refInfo);        
    //     // 
    // }

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




/**
 * Một dạng Parasitify Component, có chức năng đọc các property dạng @reference của Component trước nó, tìm ra các tham chiếu tới một hoặc nhiều Prefab (dạng load động hoặc dạng nhúng)
 * Có thể thay đổi tham số truyền vào của các @reference property của các Component bên trong Prefab (ví dụ: thay spriteframe, asset, node ...).
 * Thường được sử dụng để thay giao diện của các Prefab dùng chung.
 */
@ccclass('PrefabReferenceView')
@executeInEditMode(true)
export class PrefabReferenceView extends Parasitify(Component) {
    @property({type:[ReferenceProperty], readonly:true})
    exportedProperties:ReferenceProperty[] = [];

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
            let waitLoadingPromise:Promise<void>[] = [];
            allPrefabComponents.forEach((comp:Component)=>{                
                if(hadInjectorImplemented(comp.constructor as Constructor, PropertyExportifyInjector)){
                    const refInfos:ReferenceInfo[] = CCEditor.getChildReferenceInfo(comp, this.propertiesFillter);
                    refInfos.forEach((refInfo:ReferenceInfo)=>{
                        const refToken:number = ReferenceProperty.getTokenFrom(propertyName, refInfo);
                        const propArr:string[] = refInfo?.property?.split("::");
                        const compPropertyName:string = propArr[0];
                        const assetOrInfo:SimpleAssetInfo|EmbedAsset = this.savedAssetInfos[refToken];
                        const isLoadifiedComponent:boolean = hadInjectorImplemented(comp.constructor as Constructor, PropertyLoadifyInjector)
                        if(assetOrInfo){
                            if(isLoadifiedComponent){ comp[INFO_PROPERTY_PREFIX + compPropertyName] = null;}
                            if(ReferenceProperty.isEmbedAsset(assetOrInfo)){
                                comp[compPropertyName] = assetOrInfo;
                            }else if(isLoadifiedComponent){
                                // Truong hop asset can load, va component da co loadified injector, chuyen qua load tai component.
                                comp[INFO_PROPERTY_PREFIX + compPropertyName] = assetOrInfo;
                            }else{
                                // Truong hop asset can load, component khong co tinh nang loadified injector, thuc hien load asset truc tiep.
                                waitLoadingPromise.push(new Promise<void>(async (resolve:Function)=>{
                                    const loadedAsset:Asset = await Support.asyncLoadAssetFromSimpleAssetInfo(assetOrInfo as SimpleAssetInfo);
                                    comp[compPropertyName] = loadedAsset;
                                    resolve();
                                }))
                            }
                        }
                        // else{
                        //     log('No infomation !!! ')
                        // }
                    })   
                    // 
                }
                // else{
                //     warn('the component ' + comp.name + ' need use cocoseus.exportProperties to export properties !!')
                // }      
            })
            await Promise.all(waitLoadingPromise);
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
            // if(hadInjectorImplemented(this.host.constructor as Constructor, PropertyExportifyInjector)){
            //  Clear view.
            this.exportedProperties = [];
            // const decoratify = Decoratify(this.host);
            // CCEditor.getEditorPropertiesAtRuntime(this.host);
            // const loadedPropertyNames:string[] = Array.from(Decoratify(this.host).keys(PropertyLoadifyDecorator));   
            const loadedPropertyNames:string[] = CCEditor.getEditorPropertiesAtRuntime(this.host, this.propertiesFillter);
            if(DEV && !loadedPropertyNames.length){
                warn('This component just run with Loadified Components');
            }
            loadedPropertyNames.forEach((propName:string)=>{    
                const propArr:string[] = propName?.split("::");                                       
                if(propArr && propArr.length){
                    const propertyName:string = propArr[0];
                    const isEmbed:boolean = !!this.host[propertyName];
                    isEmbed ? this.updateEmbedProperty(propertyName) : this.updateLoadingProperty(propertyName);
                }
            });
            // 
            this.exportedProperties.forEach((refView:ReferenceProperty)=>{
                refView.updatePropertyEditorView();
            })
            // 
        }
    }

    // -----------------------------

    /**
     * 
     * @param key 
     * @param fullKey 
     * @param attrs 
     * @returns 
     */
    private propertiesFillter(key:string, fullKey:string, attrs:any):boolean{                
        return (fullKey.indexOf(WRAPPER_PROPERTY_PREFIX) == -1) && 
                fullKey.indexOf(INFO_PROPERTY_PREFIX) == -1 && 
                (fullKey.indexOf(ENUM_PROPERTY_PREFIX) == -1);
    }

    /**
     * Just execute in Editor 
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
                    // const refInfos:ReferenceInfo[] = this.super['getChildReferenceInfo'](comp);
                    const refInfos:ReferenceInfo[] = CCEditor.getChildReferenceInfo(comp, this.propertiesFillter);
                    refInfos.forEach((refInfo:ReferenceInfo)=>this.createOrUpdateReferenceInfoView(propertyName, refInfo))
                })
                // 
            }
            // 
        }
    }

    /**
     * Just execute in Editor 
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
     * 
     * Tạo ra phần tử hiển thị một ReferenceInfo. 
     * @param propertyName 
     * @param refInfo 
     */
    private createOrUpdateReferenceInfoView(propertyName:string, refInfo:ReferenceInfo){
        if(refInfo){
            // const propertyToken:number = Support.tokenize(propertyName);
            const refInfoView:ReferenceProperty = new ReferenceProperty();
            refInfoView.setData(propertyName, refInfo);   
            const token:number = refInfoView.token;
            (refInfoView as unknown as __private._cocos_core_event_eventify__IEventified).on(ReferenceProperty.EVENT.UPDATE, this.saveAsset.bind(this));
            // 
            if(this.savedAssetInfos[token]){
                refInfoView.updateAssetInfo(this.savedAssetInfos[token]);
            }
            this.exportedProperties.push(refInfoView);
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
        if(this.exportedProperties && this.exportedProperties.length){
            this.exportedProperties.forEach((refInfoView:ReferenceProperty)=>{
                (refInfoView as unknown as __private._cocos_core_event_eventify__IEventified).off(ReferenceProperty.EVENT.UPDATE, this.saveAsset);
            })
        }        
    }

    // protected onLoad(): void {        
    
    // }

    
}


