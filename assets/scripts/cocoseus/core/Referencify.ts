// Referencify

import { _decorator, Asset, assetManager, AssetManager, CCObject, Component, Constructor, director, Enum, error, find, js, log, Node, Prefab, PrefabLink, Script, warn} from "cc";
import { BabelPropertyDecoratorDescriptor, IPropertyOptions, ReferenceInfo, IReferencified, LegacyPropertyDecorator, PropertyType, IStaticReferencified, IAsyncProcessified, EmbedAsset } from "../types/CoreType";
import { Support } from "../utils/Support";
import Decoratify from "./Decoratify";
import { CACHE_KEY, hadInjectorImplemented, Inheritancify, lastInjector } from "./Inheritancify";
import Storagify from "./Storagify";
import { DEV, EDITOR } from "cc/env";
import { CCEditor, SimpleAssetInfo } from "../utils/CCEditor";
import AsyncProcessify from "./AsyncProcessify";

const { ccclass, property } = _decorator;
// const {Editor} = globalThis
let ReferenceEnum = Enum({Default:-1});

// globalThis.Editor.Message.addBroadcastListener('console:logsUpdate', () => {log('-------------------- ????????')});

export const ENUM_PROPERTY_PREFIX:string = '__$enum__';
export const INDEX_PROPERTY_PREFIX:string = '__$id__';
export const STRING_PROPERTY_PREFIX:string = '__$string__';
export const INFO_PROPERTY_PREFIX:string = '__$info__';
export const WRAPPER_PROPERTY_PREFIX:string = '__$';
export const PREFAB_DETAIL_PREFIX:string = '__$prefab__';

enum ClassType {
    ASSET,
    COMPONENT,
    NODE,
    INFO
}

export type PrefabInfo = SimpleAssetInfo & {
    references?:ReferenceInfo[]
}



// const ImageFmts = ['.png', '.jpg', '.bmp', '.jpeg', '.gif', '.ico', '.tiff', '.webp', '.image', '.pvr', '.pkm', '.astc'];
// const AudioFmts = ['.mp3', '.ogg', '.wav', '.m4a'];
// const FileExts = ImageFmts.concat(AudioFmts);
/**
 * 
 * @param base 
 * @returns 
 */
export default Inheritancify<IReferencified, IStaticReferencified>(function Referencify <TBase>(base:Constructor<TBase>):Constructor<TBase & IReferencified>{             
    class Referencified extends Storagify(Decoratify( AsyncProcessify( base as unknown as Constructor<Component>) ) ) implements IReferencified {
        
        // @property({            
        //     visible(){
        //         const propertyNames:string[] = Array.from( Decoratify(this).keys('@reference.load'));
        //         return Boolean(propertyNames && propertyNames.length);
        //     }
        // })
        // edited:boolean = false

        protected _refInfo:ReferenceInfo;

        protected _token:number = -1

        private static _references:Map<number, ReferenceInfo>;

        private static _keys:Map<number, string>;

        /**
         * Key đươc sinh ra từ ReferenceInfo.
         * 
         * @param info 
         * @returns 
         */
        private static genKey(info:ReferenceInfo):string{            
            return (info?.root ? Support.tokenize(info.root) + '.' : '') + 
                    (info?.node ? Support.pathToToken(info?.node) + '.' : '') +
                    (info?.comp ? Support.tokenize(info?.comp) + '.'  : '') + 
                    (info?.id ? Support.tokenize(info?.id?.toString()) : '0')+
                    (info?.property ? Support.tokenize(info?.property?.toString()) : '')
        }

        /**
         * Token được sinh ra từ key.
         * 
         * @param info 
         * @returns 
         */
        private static genToken(info:ReferenceInfo):number{
            return Support.tokenize(this.genKey(info))
        }

        /**
         * 
         */
        private static get references():Map<number, ReferenceInfo>{
            if(!this._references){
                this._references = Storagify(this).table<ReferenceInfo>(Referencify.name);
            }
            return this._references;
        }
        
        /**
         * 
         */
        private static get keys():Map<number, string>{
            if(!this._keys){
                this._keys = Storagify(this).table<string>(Referencify.name+'.keys');
            }
            return this._keys;
        }
        

        /**
         * 
         * @param comp 
         */
        private static register(comp:IReferencified){
            this.references.set(comp.token, comp.refInfo);
            this.keys.set(comp.token, this.genKey(comp.refInfo));
            // List referenced components
            // const refPaths:string[] = [];
            // const comps:IReferencified[] = [];
            // Referencified.keys.forEach((value:string, token:number)=>{
            //     refPaths.push(Referencified.getRefPath(token));
            //     comps.push(Referencified.getComponent(token));
            // })
            // // 
            // const ReferenceEnum:any = Support.convertToEnum(refPaths);            
            // comps.forEach((serachComp:IReferencified)=>{
            //     serachComp.updateReferenceEnum && serachComp.updateReferenceEnum(ReferenceEnum);
            // })

            // const json:string = JSON.stringify(Array.from(this.references)); 
            // const map:Map<any,any> = new Map(JSON.parse(json));
            // scene:component-removed
            // log('All:: ' + json) ;
            
        }

        /**
         * 
         * @param comp 
         * @returns 
         */
        private static hasRegisted(comp:IReferencified):boolean{
            return this.references.has(comp.token)
        }
        
        /**
         * 
         * @param comp 
         */
        private static remove(comp:IReferencified){
            this.references.delete(comp.token);
            this.keys.delete(comp.token);            
        }

        
        /**
         * 
         * @param token 
         * @returns 
         */
        static getRefPath(token:number):string{
            const refInfo:ReferenceInfo = this.getRefInfo(token);
            return '[' + refInfo?.comp + ']' + (refInfo.id ? '(' +refInfo.id+')' : '' ) + '<' + refInfo?.node + '>' + '%' + refInfo.root + '%';
        }

        /**
         * 
         * @param token 
         * @returns 
         */
        static getRefInfo(token:number):ReferenceInfo{
            return Referencified.references.get(token);
        }

        /**
         * 
         * @param token 
         * @returns 
         */
        static getComponent<T=Component>(token:number):T{
            const info:ReferenceInfo = Referencified.getRefInfo(token);            
            return find(info.node)?.getComponents(info.comp)?.find((comp, index)=> index == info.id) as T;
        }

        /**
         * 
         * @param searchValue 
         * @returns 
         */
        static findToken(searchValue:string):number{
            const searchToken:string = Support.tokenize(searchValue.trim()).toString();
            const shortcutToken:string = Support.searchStringArray(searchToken, Array.from(this.keys.values()))
            return shortcutToken ? Support.tokenize(shortcutToken) : -1;
        }

        /**
         * 
         * @param token 
         * @returns 
         */
        static validToken(token:number):boolean{
            return Referencified.references.has(token);
        }

        

        /**
         * Called when the particular asset is loaded.
         * @param propertyName 
         * @param asset 
         */
        async onLoadedAsset(propertyName:string, asset:Asset){            
            
        }

        /**
         * Run on Editor. When the particular asset is changed.
         * @param propertyName 
         */
        async onEditorAssetChanged(propertyName:string){

        }

        /**
         * Phân tích asset khi là Prefab. Lưu thêm thông tin về các ReferenceInfo. Phục vụ viec skinable and rechange properties.
         * @param propertyName 
         * @param asset 
         * @returns 
         */
        async analysisAsset<T= Asset>(propertyName:string, asset:T):Promise<SimpleAssetInfo>{
            let simpleAssetInfo:SimpleAssetInfo = await CCEditor.getSimpleAssetInfo(asset as Asset);
            if(asset && js.isChildClassOf(asset.constructor, Prefab)){
                const prefabInfo:PrefabInfo = simpleAssetInfo;                
                let allPrefabComponents:Component[] = ((asset as Prefab).data as Node).getComponentsInChildren(Component);
                allPrefabComponents.forEach((comp:Component)=>{
                    if(!prefabInfo.references) prefabInfo.references = [];
                    const refInfos:ReferenceInfo[] = this.getChildReferenceInfo(comp)
                    prefabInfo.references = prefabInfo.references.concat(refInfos);
                })
            }
            return simpleAssetInfo;
        }

        // --------------- PRIVATE --------------
        /**
         * 
         * @param fromComponent 
         * @returns 
         */
        private getChildReferenceInfo(fromComponent:Component):ReferenceInfo[]{   
            const refInfos:ReferenceInfo[] = [];         
            if(hadInjectorImplemented(fromComponent.constructor as Constructor, Referencify.name)){
                const classType:string = js.getClassName(fromComponent);
                const localNodePath:string = fromComponent?.node?.getPathInHierarchy();
                const loadedPropertyNames:string[] = Array.from(Decoratify(fromComponent).keys('@reference'));
                loadedPropertyNames.forEach((recoredPropertyName:string)=>{                                                          
                    if(recoredPropertyName){
                        const tempRefInfo:ReferenceInfo = Object.create(null);
                        tempRefInfo.comp = classType;
                        tempRefInfo.node = localNodePath;
                        tempRefInfo.property = recoredPropertyName;
                        refInfos.push(tempRefInfo);
                    }
                })
                return refInfos;
            }
            return refInfos
        }
        // -------------------------------------

        // async loadEachAsset(propertyRecord:string, assetInfo:SimpleAssetInfo):Promise<Asset>{
        //     return await loadAsset(assetInfo, js.getClassByName(assetInfo.type));
        // }

        // -------------

        protected async preloadingAssets(){
            
        }

        /**
         * 
         */
        protected async startLoadingAssets(){
            const thisAsyncLoading:IAsyncProcessified = this as unknown as IAsyncProcessified;
            const propertyRecord:string[] = Array.from( Decoratify(this).keys('@reference.load'));
            if(thisAsyncLoading.isProgressing()) { await thisAsyncLoading.wait()}
            else if(!thisAsyncLoading.isProgressing() && propertyRecord && propertyRecord.length){                
                thisAsyncLoading.begin(-1);                
                // 
                const promises:Promise<any>[] = []
                propertyRecord.forEach((recordContent:string)=>{
                    const propArr:string[] = recordContent?.split("::");
                    if(propArr && propArr.length){                    
                        const propertyName:string = propArr[0];
                        const classTypeName:string = propArr[1];
                        const classType:any = js.getClassByName(classTypeName);
                        const assetInfo:SimpleAssetInfo = this[INFO_PROPERTY_PREFIX + propertyName];
                        if(propertyName && classType && assetInfo){                            
                            promises.push(new Promise(async (resolve:Function)=>{
                                // const asset:Asset = await loadAsset(assetInfo, classType);
                                const asset:Asset = await loadAsset(assetInfo, js.getClassByName(assetInfo.type));
                                this[propertyName] = asset;
                                resolve(asset);
                            }) )

                        }else{
                            // DEV && error('Unload ' + propertyName)
                        }
                    }
                });
                await Promise.all(promises);
                // 
                thisAsyncLoading.end(-1);
            }
            // 
            const promises:Promise<any>[] = [];
            const loadedPropertyRecord:string[] = Array.from( Decoratify(this).keys('@reference'));
            loadedPropertyRecord.forEach((recordContent:string)=>{
                const propArr:string[] = recordContent?.split("::");
                if(propArr && propArr.length){                    
                    const propertyName:string = propArr[0];
                    if(!!this[propertyName]){ 
                        promises.push(this.onLoadedAsset(propertyName, this[propertyName]));
                    }
                }
            })
            await Promise.all(promises);
            // 
        }

                
        // ---------------



        /**
         * 
         */
        // public get internalStart (): (() => void) | undefined {
        //     return async ()=>{
        //         await this.startLoadingAssets();
        //         super['internalStart'] && super['internalStart']();
        //     } 
        // }

        /**
         * 
         */
        public get internalOnLoad (): (() => void) | undefined {
            !Referencified.hasRegisted(this) && Referencified.register(this);            
            return async ()=>{
                await this.preloadingAssets();
                await this.startLoadingAssets();
                super['internalOnLoad'] && super['internalOnLoad']();
                // log('===========?????==> internalOnLoad !!' + this.node?.name)
            }            
        }

        /**
         * 
         */
        public get internalOnDisable (): (() => void) | undefined {
            Referencified.hasRegisted(this) && Referencified.remove(this);
            return super['internalOnDisable']
        }

        /**
         * 
         */
        get token():number{
            if(!this._token || this._token == -1){
                this._token = Referencified.genToken(this.refInfo)
            }
            return this._token
        }

        /**
         * 
         */
        get refInfo():ReferenceInfo{
            if(this.node && !this._refInfo){
                const hierachyPath:string = this.node.getPathInHierarchy();
                const compName:string = this.constructor.name;
                const orderIndex:number = this.node.getComponents(compName).findIndex((_comp:Component)=>_comp === this)||0;                
                this._refInfo = {
                    root:director.getScene().name,
                    node:hierachyPath,
                    comp:compName,
                    id:orderIndex
                }
            }
            return this._refInfo;
        };

        /**
         * 
         */
        // updateReferenceEnum(enumData:any):void{            
        //     return
        //     const propertyNames:string[] = Array.from( Decoratify(this).keys('@reference'));
        //     propertyNames.forEach((propName:string)=>{
        //         const enumPropertyName:any = ENUM_PROPERTY_PREFIX + propName;
        //         CCEditor.enumifyProperty(this, enumPropertyName, enumData);
        //     })
        // }

    }
    return Referencified as unknown as Constructor<TBase & IReferencified>;

}) 



// ----------- Decorator ------------

/**
 * Phù hợp với việc sử dụng trong prefab độc lập để trỏ đến một component ngoài scene.
 * @param options 
 */
export function reference(options?: IPropertyOptions|string|unknown): LegacyPropertyDecorator;
export function reference(type?: PropertyType): LegacyPropertyDecorator;
export function reference(...args: Parameters<LegacyPropertyDecorator>): void;
export function reference(
    target?: Parameters<LegacyPropertyDecorator>[0]| PropertyType, 
    propertyKey?: Parameters<LegacyPropertyDecorator>[1], 
    descriptorOrInitializer?: BabelPropertyDecoratorDescriptor
){
    let options: string|IPropertyOptions | PropertyType | null | unknown = null;    
    function normalized (target: Parameters<LegacyPropertyDecorator>[0],
        propertyKey: Parameters<LegacyPropertyDecorator>[1],
        descriptorOrInitializer:  BabelPropertyDecoratorDescriptor)
    {     
        // 
        const propertyName:string = propertyKey.toString();        
        // 
        
        //   
        if(!options){
            options = {type:Asset};
        };
        const propertyType:ClassType = detechBaseCCObject((options as IPropertyOptions)?.type);
        const classType:string = getClassName((options as IPropertyOptions).type);
        const recordContent:string = propertyName + (classType ? "::" + classType : "");
        switch(propertyType){
            case ClassType.ASSET:
                defineSmartProperty(target, propertyName, options, descriptorOrInitializer);                
                Decoratify(target).record(recordContent, '@reference.load');
                break;
            default:
                CCEditor.createEditorClassProperty(target, propertyName, options, descriptorOrInitializer);
                break;
        }   
        Decoratify(target).record(recordContent, '@reference');
        return descriptorOrInitializer
    }
    

    if (target === undefined) {
        // @audio() => LegacyPropertyDecorator
        return reference({
            type: Component,
        });
    } else if (typeof propertyKey === 'undefined') {
        options = target;
        return normalized;
    } else {
        // @audio
        normalized(target as Parameters<LegacyPropertyDecorator>[0], propertyKey, descriptorOrInitializer);
        return undefined;
    }
}

/**
 * 
 * @param target 
 * @param propertyName 
 * @param options 
 * @param descriptorOrInitializer 
 */
function defineSmartProperty(target:Record<string, any>, propertyName:string, options:IPropertyOptions, descriptorOrInitializer:  BabelPropertyDecoratorDescriptor){
    const enumPropertyName:any = ENUM_PROPERTY_PREFIX + propertyName;
    const wrapperPropertyName:any = WRAPPER_PROPERTY_PREFIX + propertyName;    
    const infoPropertyName:any = INFO_PROPERTY_PREFIX + propertyName;
    // const prefabPropertyName:any = PREFAB_DETAIL_PREFIX + propertyName;
    // const propertyType:ClassType = detechBaseCCObject((options as IPropertyOptions).type);
    // 
    // Record info -------------
    const infoPropertyDescriptor:PropertyDescriptor = {value:null, writable:true}    
    const infoOption:IPropertyOptions = {serializable:true, visible:false};
    CCEditor.createEditorClassProperty(target, infoPropertyName,infoOption, infoPropertyDescriptor);
    // -------------------------- End info

    // Define Enum ------------------------------
    const enumPropetyDescriptor:PropertyDescriptor = {
        get():number{
            return !!this[infoPropertyName] ? 1:0;
        },
        set(val:number){
            if(val == 0){
                this[wrapperPropertyName] = null;
                this[infoPropertyName] = null;
                this[propertyName] = null;
                EDITOR && this.onEditorAssetChanged(propertyName);
            }
        }
    }
    //
    const enumOption:IPropertyOptions = {
        type:Enum({NONE:0}),
        displayName:Support.upperFirstCharacter(propertyName),
        visible(){
            return !!this[infoPropertyName]
        }
    }
    CCEditor.createEditorClassProperty(target, enumPropertyName, enumOption, enumPropetyDescriptor);
    // ------------------------------ end Define Enum
   
    // Define Wrapper ------------------------------
    const wrapperDescriptor:PropertyDescriptor = {
        get():EmbedAsset{                
            if(this[infoPropertyName]){
                const assetPath:string = this[infoPropertyName]?.url + ' [' + this[infoPropertyName]?.bundle + ']';
                CCEditor.enumifyProperty(this, enumPropertyName, Support.convertToEnum(['REMOVE', assetPath]));                
            }            
            return this[propertyName];
        },
        set:async function(asset:EmbedAsset){
            if(EDITOR){
                const assetInfo:SimpleAssetInfo = await this.analysisAsset(propertyName, asset);
                if(!!assetInfo){
                    const bundleName:string = assetInfo.bundle;
                    //       
                    if( !!bundleName &&
                        bundleName !== AssetManager.BuiltinBundleName.INTERNAL &&
                        bundleName !== AssetManager.BuiltinBundleName.MAIN  &&
                        bundleName !== AssetManager.BuiltinBundleName.START_SCENE){
                        // 
                        this[infoPropertyName] = assetInfo;
                        const assetPath:string = this[infoPropertyName]?.url + ' [' + this[infoPropertyName]?.bundle + ']';
                        CCEditor.enumifyProperty(this, enumPropertyName, Support.convertToEnum(['REMOVE', assetPath]));
                        this[propertyName] = null
                        this.onEditorAssetChanged(propertyName);
                        return false
                        // 
                    }else{
                        this[infoPropertyName] = null;
                    }
                }
                
            }
            // 
            this[propertyName] = asset;
            EDITOR && this.onEditorAssetChanged(propertyName);
        },
        configurable: descriptorOrInitializer.configurable,
        enumerable: descriptorOrInitializer.enumerable,
        // writable: descriptorOrInitializer.writable,        
    } as PropertyDescriptor;

    const wrapperOption:IPropertyOptions = Object.assign({}, options, {
        displayName:Support.upperFirstCharacter(propertyName),
        visible(){
            return !this[infoPropertyName];
        }
    }) as IPropertyOptions;
    CCEditor.createEditorClassProperty(target, wrapperPropertyName, wrapperOption, wrapperDescriptor)
    // ------------------------------------- end Define Wrapper

    // Current property ---------------
    if(!!options){
        (options as IPropertyOptions).visible = false;
        (options as IPropertyOptions).serializable = true;    
    }
    CCEditor.createEditorClassProperty(target, propertyName, options, descriptorOrInitializer);
    
}

/**
 * 
 * @param classTypes 
 */
function detechBaseCCObject(classTypes:Constructor<any>|Constructor<any>[]):ClassType{    
    const classType:Constructor<any> = getClassType(classTypes)    
    if(classType){
        switch(true){            
            case js.isChildClassOf(classType, Asset): return ClassType.ASSET;
            case js.isChildClassOf(classType, Component): return ClassType.COMPONENT;
            case js.isChildClassOf(classType, Node): return ClassType.NODE;
            default: return ClassType.INFO
        }
    }
    return null;
}

// type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;


function prefabDetailInfo(prefab:Prefab){}

/**
 * 
 * @param classTypes 
 * @returns 
 */
function getClassType(classTypes:Constructor<any>|Constructor<any>[]):Constructor<any>{
    if(!classTypes) return null;
    const classType:Constructor<any> = Array.isArray(classTypes) ? classTypes[0] : classTypes;
    if(!classType) error('Type is empty !');
    return classType;
}

/**
 * 
 * @param classTypes 
 * @returns 
 */
function getClassName(classTypes:Constructor<any>|Constructor<any>[]):string{
    const classType:Constructor<any> = getClassType(classTypes)
    return js.getClassName(classType);
}


async function loadAsset(assetInfo:SimpleAssetInfo, classType:any):Promise<Asset>{
    if(!assetInfo) return null
    if(!assetInfo.bundle?.length) error('Asset no bundle !!');
    if(!EDITOR){
        const bundleName:string = assetInfo.bundle;
        let bundle:AssetManager.Bundle = assetManager.getBundle(bundleName);
        if(!bundle){
            bundle = await new Promise<AssetManager.Bundle>((resolve:Function)=>{
                assetManager.loadBundle(bundleName,(err:Error, downloadBundle:AssetManager.Bundle)=>{                   
                    if(!err){                               
                        resolve(downloadBundle);
                    }else{
                        DEV && error('Bundle Loading Error ' + err + ' bundle name: ' + bundleName);
                        resolve(null)
                    }                    
                }) 
            })
        }
        if(!bundle){
            error('Bundle ' + bundleName + ' is not found !');
            return null
        }
        const assetPath:string = assetInfo.url;
        let remoteAsset:Asset = bundle.get(assetPath, classType);
        if(!remoteAsset){
            remoteAsset = await new Promise((resolve:Function)=>{
                bundle.load(assetPath, classType, (err:Error, prefab:Asset ) =>{                
                    if(!err){                                               
                        // this.instantiateLoadedPrefab(prefab);
                        resolve(prefab)
                    }else{
                        DEV && error('Asset Loading Error: ' + assetPath + ' with bundle: ' + bundle.name + ' -node ' + this?.node?.getPathInHierarchy() )       
                        resolve(null);
                    }     
                    
                })
            })
        }
        if(!remoteAsset) {
            error('Asset ' + assetPath + ' in bundle '+ bundleName + ' is not found !');
            return null
        }

        DEV && warn('---- load success:: ' + assetInfo.name);
        return remoteAsset
    }else{

    }
    return
}