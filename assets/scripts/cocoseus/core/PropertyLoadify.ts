import { Asset, AssetManager, CCClass, CCObject, Component, Constructor, Enum, Node, Prefab, assetManager, error, js, log, warn } from "cc";
import { CCClassify, Inheritancify, hadInjectorImplemented } from "./Inheritancify";
import { EmbedAsset, IAsyncProcessified, IPropertyLoadified, IPropertyOptions, IStaticPropertyLoadified, PrefabInfo, PropertyStash, ReferenceInfo, SimpleAssetInfo } from "../types/CoreType";
import { CACHE_KEY, CCEditor } from "../utils/CCEditor";
import { Support } from "../utils/Support";
import { DEV, EDITOR } from "cc/env";
// import Decoratify from "./Decoratify";
import AsyncProcessify from "./AsyncProcessify";
import Decoratify from "./Decoratify";

export const ENUM_PROPERTY_PREFIX:string = '__$enum__';
export const INFO_PROPERTY_PREFIX:string = '__$info__';
export const WRAPPER_PROPERTY_PREFIX:string = '__$';
// const INDEX_PROPERTY_PREFIX:string = '__$id__';
// const STRING_PROPERTY_PREFIX:string = '__$string__';
// const PREFAB_DETAIL_PREFIX:string = '__$prefab__';

export const PropertyLoadifyInjector:string = 'PropertyLoadify';
export const PropertyLoadifyDecorator:string = '@property.load';

export default CCClassify<IPropertyLoadified, IStaticPropertyLoadified>(function PropertyLoadify <TBase>(base:Constructor<TBase>):Constructor<TBase & IPropertyLoadified>{
    // 
    class PropertyLoadified extends AsyncProcessify(Decoratify (base as unknown as Constructor<Component>)) implements IPropertyLoadified {

        protected onLoad(): void {
            console.log('loading completed !!')
            if(super.onLoad){
                this.asyncLoadingAssets().then(super.onLoad.bind(this))
            }
        }

        /**
         * Called when the particular asset is loaded.
         * @param propertyName 
         * @param asset 
         */
        async onLoadedAsset(propertyName:string, asset:Asset){            
            if(super['onLoadedAsset']) await super['onLoadedAsset'](propertyName);
        }

        /**
         * Run on Editor. When the particular asset is changed.
         * @param propertyName 
         */
        async onEditorAssetChanged(propertyName:string){
            if(super['onEditorAssetChanged']) await super['onEditorAssetChanged'](propertyName);
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
                    const refInfos:ReferenceInfo[] = this.getChildReferenceInfo(comp);
                    prefabInfo.references = prefabInfo.references.concat(refInfos);
                })
            }
            return simpleAssetInfo;
        }


                /**
                 * 
                 * @param fromComponent 
                 * @returns 
                 */
                private getChildReferenceInfo(fromComponent:Component):ReferenceInfo[]{   
                    const refInfos:ReferenceInfo[] = [];         
                    if(hadInjectorImplemented(fromComponent.constructor as Constructor, PropertyLoadifyInjector)){
                        const classType:string = js.getClassName(fromComponent);
                        const localNodePath:string = fromComponent?.node?.getPathInHierarchy();
                        const loadedPropertyNames:string[] = Array.from(Decoratify(fromComponent).keys(PropertyLoadifyDecorator));
                        // const loadedPropertyNames:string[] = Array.from(decorated(fromComponent).keys());
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

        /**
         * 
         */
        protected async asyncLoadingAssets(){
            const thisAsyncLoading:IAsyncProcessified = this as unknown as IAsyncProcessified;
            const propertyRecord:string[] = Array.from( Decoratify(thisAsyncLoading).keys(PropertyLoadifyDecorator));
            // const propertyRecord:string[] = Array.from(decorated(thisAsyncLoading).keys());
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
                        const assetInfo:SimpleAssetInfo = thisAsyncLoading[INFO_PROPERTY_PREFIX + propertyName];
                        if(propertyName && classType && assetInfo){                            
                            promises.push(new Promise(async (resolve:Function)=>{
                                // const asset:Asset = await loadAsset(assetInfo, classType);
                                const asset:Asset = await this.loadEachAsset(assetInfo, js.getClassByName(assetInfo.type));
                                thisAsyncLoading[propertyName] = asset;
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
            const loadedPropertyRecord:string[] = Array.from( Decoratify(this).keys(PropertyLoadifyDecorator));
            // const loadedPropertyRecord:string[] = Array.from(decorated(thisAsyncLoading).keys());
            loadedPropertyRecord.forEach((recordContent:string)=>{
                const propArr:string[] = recordContent?.split("::");
                if(propArr && propArr.length){                    
                    const propertyName:string = propArr[0];                    
                    if(!!Object.prototype.hasOwnProperty.call(thisAsyncLoading, propertyName)){ 
                        promises.push(this.onLoadedAsset(propertyName, thisAsyncLoading[propertyName]));
                    }
                }
            })
            await Promise.all(promises);
            // 
        }

        /**
         * 
         * @param assetInfo 
         * @param classType 
         * @returns 
         */
        async loadEachAsset(assetInfo:SimpleAssetInfo, classType:any):Promise<Asset>{
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
        
                // DEV && warn('---- load success:: ' + assetInfo.name);
                return remoteAsset
            }else{
        
            }
            return
        }        
    }

    // Apply to all @property decorator.
    const cache = base[CACHE_KEY];    
    if (cache) {
        const decoratedProto = cache.proto;
        if (decoratedProto) {
            const properties:Record<string, any> = decoratedProto.properties;
            // 
            PropertyLoadified[CACHE_KEY] = js.createMap();
            const classStash:unknown = PropertyLoadified[CACHE_KEY] || ((PropertyLoadified[CACHE_KEY]) ??= {});
            const ccclassProto:unknown = classStash['proto'] || ((classStash['proto'])??={});
            const injectorProperties:unknown = ccclassProto['properties'] || ((ccclassProto['properties'])??={});
            // 
            const keys:string[] = Object.keys(properties);
            keys.forEach((propertyName:string)=>{
                const propertyStash:PropertyStash = injectorProperties[propertyName] ??= {};
                js.mixin(propertyStash, properties[propertyName])
                remakeProperty(PropertyLoadified, propertyName, injectorProperties);

            })            
        }
        base[CACHE_KEY] = undefined;
    }

    return PropertyLoadified as unknown as Constructor<TBase & IPropertyLoadified>;
}, PropertyLoadifyInjector)


// ----------

/**
 * 
 * @param constructor 
 * @param propertyName 
 * @param properties 
 */
function remakeProperty(constructor:Constructor, propertyName:string, properties:any){
    const options:IPropertyOptions = properties[propertyName];
    // Do not support Class Array Type.
    const isTypeArray:boolean = options.type && Array.isArray(options.type);
    let classType:CCObject = options.type;
    if(isTypeArray){
        DEV && warn('Now, we do not support array of type at ' + propertyName)
        return;
    }else{

    }
    
    // 
    const isAsset:boolean = js.isChildClassOf(options.type, Asset);
    if(isAsset){
        // Tag these propeties would be loading at the runtime.
        const classTypeName:string = js.getClassName(classType);
        const recordContent:string = propertyName + (classTypeName ? "::" + classTypeName : "");
        // const records:Set<string> = decorated(constructor)
        // !records.has(recordContent) && records.add(recordContent);
        Decoratify({constructor}).record(recordContent, PropertyLoadifyDecorator);
        // 
        defineSmartProperty(constructor, propertyName, options);        
    }
    // 
}


function decorated(target:any):Set<string>{
    const ctor:Constructor = target.prototype ? target : target.constructor;
    return ctor[PropertyLoadifyDecorator] || (ctor[PropertyLoadifyDecorator] = new Set<string>())
}


/**
 * 
 * @param target 
 * @param propertyName 
 * @param options 
 * @param descriptorOrInitializer 
 */
function defineSmartProperty(target:Record<string, any>, propertyName:string, options:IPropertyOptions, descriptorOrInitializer?:  PropertyDescriptor){
    const enumPropertyName:any = ENUM_PROPERTY_PREFIX + propertyName;
    const wrapperPropertyName:any = WRAPPER_PROPERTY_PREFIX + propertyName;    
    const infoPropertyName:any = INFO_PROPERTY_PREFIX + propertyName;
    // 
    descriptorOrInitializer ??= js.getPropertyDescriptor(target.prototype, propertyName)
    // Record info -------------
    const infoPropertyDescriptor:PropertyDescriptor = {value:null, writable:true};
    const infoOption:IPropertyOptions = {
        // type:options.type,
        serializable:true, 
        visible:false
    };
    CCEditor.createEditorClassProperty(target, infoPropertyName, infoOption, infoPropertyDescriptor);
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
                // const assetInfo:SimpleAssetInfo = await CCEditor.getSimpleAssetInfo(asset as Asset);
                if(!!assetInfo){
                    const bundleName:string = assetInfo.bundle;
                    //       
                    if( !!bundleName &&
                        bundleName !== AssetManager.BuiltinBundleName.INTERNAL &&
                        bundleName !== AssetManager.BuiltinBundleName.MAIN  &&
                        bundleName !== AssetManager.BuiltinBundleName.START_SCENE   ){
                        // 
                        this[infoPropertyName] = assetInfo;
                        const assetPath:string = this[infoPropertyName]?.url + ' [' + this[infoPropertyName]?.bundle + ']';
                        CCEditor.enumifyProperty(this, enumPropertyName, Support.convertToEnum(['REMOVE', assetPath]));
                        this[propertyName] = null;
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
        configurable: true,
        enumerable: false        
    } as PropertyDescriptor;

    const wrapperOption:IPropertyOptions = Object.assign({}, options, {
        type:options.type,
        displayName:Support.upperFirstCharacter(propertyName),
        visible(){
            return !this[infoPropertyName];
        }
    }) as IPropertyOptions;
    CCEditor.createEditorClassProperty(target, wrapperPropertyName, wrapperOption, wrapperDescriptor);
    
    // ------------------------------------- end Define Wrapper
    
    // Current property ---------------
    if(!!options){
        (options as IPropertyOptions).visible = false;
        (options as IPropertyOptions).serializable = true;    
    }
    // CCEditor.createEditorClassProperty(target, propertyName, options, descriptorOrInitializer);
    
}