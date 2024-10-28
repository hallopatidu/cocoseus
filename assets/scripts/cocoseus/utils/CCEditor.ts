import { __private, _decorator, Asset, CCClass, Component, Constructor, Enum, js, Node } from 'cc';
import { EDITOR } from 'cc/env';
import { Support } from './Support';
import { ClassStash, DecorateHandlerType, DecoratePropertyType, IPropertyOptions, LegacyPropertyDecorator, PropertyStash, PropertyStashInternalFlag, PropertyType, ReferenceInfo, SimpleAssetInfo } from '../types/CoreType';

const { ccclass, property } = _decorator;
const SPLIT_KEY:string = '$_$';

export const CACHE_KEY = '__ccclassCache__';


type  AssetMeta = {
    files: string[];
    imported: boolean;
    importer: string;
    subMetas: {
        [id: string]: any;
    };
    userData: {
        [key: string]: any;
        bundleConfigID?: string,
        bundleName?: string,
        isBundle?: true,
        priority?: number
    };
    uuid: string;
    ver: string;
}

type AssetInfo = {
    name: string;
    displayName: string;
    source: string;
    path: string;
    url: string;    
    file: string;    
    uuid: string;    
    importer: string;    
    type: string;    
    isDirectory: boolean;    
    library: { [key: string]: string };    
    subAssets: { [key: string]: AssetInfo };    
    visible: boolean;    
    readonly: boolean;    
    instantiation?: string;    
    redirect?: any;
    extends?: string[];
    imported: boolean;
    invalid: boolean;
}

@ccclass('CCEditor')
export class CCEditor {

    /**
     * await Editor.Message.request('asset-db', 'query-asset-info', urlOrUUIDOrPath);
     * @param uuid 
     * @returns 
     */
    private static async getAssetInfo_Editor(uuid:string):Promise<SimpleAssetInfo>{
        if(EDITOR){
            // Underconstructor
            const assetInfo:AssetInfo = await globalThis.Editor.Message.request('asset-db', 'query-asset-info', uuid) as AssetInfo;
            if(assetInfo){
                // const assetURL:string = assetInfo.url.slice();
                const assetPath:string = assetInfo.path.slice();
                const info:SimpleAssetInfo = await this.generateSimpleAssetInfoFromUrl_Editor(assetPath);
                if(info){
                    if(assetInfo.type){
                        info.type = assetInfo.type;
                    }
                    info.uuid = uuid;
                    info.name = assetInfo.name;
                    // info.url = assetInfo.path
                    return info
                }

            }            
        }        
        return null
    }

    /**
     * 
     * @param assetPath 
     * @param simpleInfo 
     * @param generator 
     * @returns 
     */
    private static async generateSimpleAssetInfoFromUrl_Editor(assetPath:string|null, simpleInfo?:SimpleAssetInfo, generator:Generator<string[]> = Support.getPartialPath(assetPath)):Promise<SimpleAssetInfo|null>{
        if(EDITOR){
            const simpleAssetInfo:SimpleAssetInfo = simpleInfo || js.createMap();
            const pathInfos:string[] = generator.next()?.value;            
            if(pathInfos && pathInfos.length){         
                const path:string = pathInfos[0];
                const assetName:string = pathInfos[1];
                if(path && path.length){                    
                    const meta:AssetMeta = await globalThis.Editor.Message.request('asset-db', 'query-asset-meta', 'db://' + path);
                    if(meta && meta.userData && meta.userData?.isBundle){
                        simpleAssetInfo.bundle = meta.userData?.bundleName || assetName;
                        simpleAssetInfo.url = assetPath.replace('db://' + path,'').replace(/\.[^/.]+$/, "");
                    };            
                    return await this.generateSimpleAssetInfoFromUrl_Editor(assetPath, simpleAssetInfo, generator) || simpleAssetInfo
                }
            }else{
                return simpleAssetInfo;
            }
        }
        return null;
    }

    // -----------------

    /**
     * 
     * @param fromComponent 
     * @param fillter 
     * @returns 
     */
    static getEditorPropertiesAtRuntime(fromComponent:Component, fillter?:(key:string, fullKey:string, attrs:any)=>boolean):string[]{
        const attrs:any = CCClass.Attr.getClassAttrs(fromComponent.constructor);
        const attrKeys:string[] = Object.keys(attrs);
        return attrKeys.reduce((results:string[], fullKey:string)=>{
            const splitKeyFeatures:any[] = fullKey.split(SPLIT_KEY);
            const key:string = splitKeyFeatures[0];            
            if(key && (fillter ? fillter(key, fullKey, attrs) : true) ){
                const fullCtorKey:string = key+SPLIT_KEY+'ctor';
                const fullTypeKey:string = key+SPLIT_KEY+'type';
                const type:string = attrs[fullCtorKey] ? js.getClassName(attrs[fullCtorKey]) : (attrs[fullTypeKey] || null);
                const recordPropertyKey:string = key + (type ? '::'+type : '');
                results.indexOf(recordPropertyKey) == -1 && results.push(recordPropertyKey);
            }
            return results;
        }, [])
    }    

    /**
     * 
     * @param fromComponent 
     * @returns 
     */
    static getChildReferenceInfo(fromComponent:Component, fillter?:(key:string, fullKey:string, attrs:any)=>boolean):ReferenceInfo[]{   
        const refInfos:ReferenceInfo[] = [];        
        const classType:string = js.getClassName(fromComponent);
        const localNodePath:string = fromComponent?.node?.getPathInHierarchy();
        const loadedPropertyNames:string[] = this.getEditorPropertiesAtRuntime(fromComponent, fillter);        
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
    
    /**
     * 
     * @param uuid 
     * @returns 
     */
    static async getBundleName(asset:Asset):Promise<string>{
        if(EDITOR){
            const info:SimpleAssetInfo = await this.getAssetInfo_Editor(asset.uuid);
            return info.bundle;
        }
        return null
    }

    /**
     * 
     * @param asset 
     * @returns 
     */
    static async getSimpleAssetInfo(asset:Asset):Promise<SimpleAssetInfo>{
        return EDITOR && asset && asset.uuid ?  await this.getAssetInfo_Editor(asset.uuid) : null;
    }

    /**
     * 
     * @param targetObj 
     * @param propName 
     * @param newEnum 
     * @returns 
     */
    static enumifyProperty (targetObj:any, propName:string , newEnum:unknown):any {
        let defaultEnum = Object.assign( Enum({}) , newEnum);
        Enum['update'](defaultEnum);
        CCClass["Attr"].setClassAttr(targetObj, propName, 'type', 'Enum');
        CCClass["Attr"].setClassAttr(targetObj, propName, 'enumList', Enum["getList"](defaultEnum));
        return defaultEnum;
    }

    /**
     * 
     * @param targetObj 
     * @param propName 
     * @param propType 
     * @param value 
     */
    static changeEditorProperty(targetObj:any, propName:string , displayName:string, classTypeName:string):any {        
        CCClass["Attr"].setClassAttr(targetObj, propName, 'type', 'Object');      
        CCClass["Attr"].setClassAttr(targetObj, propName, 'ctor', js.getClassByName(classTypeName));  
        CCClass["Attr"].setClassAttr(targetObj, propName, 'displayName', displayName);
    }
    // 

    
    // 
    
    // 
    /**
     * 
     * @param target 
     * @param propertyName 
     * @param option 
     * @param propertyDescriptor 
     */
    static createEditorClassProperty(target:Record<string, any>, propertyName:string, option:IPropertyOptions, propertyDescriptor:PropertyDescriptor){ 
        let prototype;
        let constructor;
        if(!!(target as Constructor).prototype){            
            prototype = (target as Constructor).prototype;
            constructor = target;
        } else{
            constructor = target.constructor;
            prototype = target;
        }
        // 
        if(!Object.prototype.hasOwnProperty.call(prototype, propertyName)){
            Object.defineProperty(prototype, propertyName, propertyDescriptor); 
        }
        // 
        const propertyNormalized:LegacyPropertyDecorator = property(option);
        propertyNormalized(prototype, propertyName, propertyDescriptor);
        const isGetset = propertyDescriptor && typeof propertyDescriptor !== 'function' && (propertyDescriptor.get || propertyDescriptor.set);
        if(isGetset){
            const classStash:unknown = constructor[CACHE_KEY] || ((constructor[CACHE_KEY]) = {});
            const ccclassProto:unknown = classStash['proto'] || ((classStash['proto'])={});
            const properties:unknown = ccclassProto['properties'] || ((ccclassProto['properties'])={});
            const propertyStash:PropertyStash = properties[propertyName] ??= {};
            if(Object.prototype.hasOwnProperty.call(propertyStash, 'default')) {
                delete propertyStash.default;
            }
        }
    }

    /**
     * 
     * @param constructor 
     * @returns 
     */
    static extendClassCache<TStaticInjector>(constructor:TStaticInjector):TStaticInjector{
        let base = js.getSuper(constructor as Constructor);
        if (base === Object) {
            base = null;
        }
        // 
        const cache = base[CACHE_KEY];
        if (cache) {
            const decoratedProto = cache.proto;
            if (decoratedProto) {
                decoratedProto.extends = base;
                decoratedProto.ctor = constructor;
            }
            base[CACHE_KEY] = undefined;                
        }
        //         
        const classStash:ClassStash = constructor[CACHE_KEY] || (constructor[CACHE_KEY] ??= js.createMap());
        constructor[CACHE_KEY] = js.mixin(classStash, cache);
        // 
        return constructor;
    }
    // 

    /**
     * 
     * @param target 
     * @param propertyKey 
     * @returns 
     */
    static getOrCreatePropertyStash (
        target: Parameters<LegacyPropertyDecorator>[0],
        propertyKey: Parameters<LegacyPropertyDecorator>[1],
        descriptorOrInitializer?: Parameters<LegacyPropertyDecorator>[2],
    ): PropertyStash {
        const classStash:unknown = target.constructor[CACHE_KEY] || ((target.constructor[CACHE_KEY]) = {});
        const ccclassProto = this.getSubDict(classStash, 'proto' as never);
        const properties:any = this.getSubDict(ccclassProto, 'properties' as never);
        const propertyStash:PropertyStash = properties[(propertyKey as string)] ??= {} as PropertyStash;        
        // propertyStash.__internalFlags |= PropertyStashInternalFlag.CUSTOME;
        // 
        if (descriptorOrInitializer && typeof descriptorOrInitializer !== 'function' && (descriptorOrInitializer.get || descriptorOrInitializer.set)) {
            if (descriptorOrInitializer.get) {
                propertyStash.get = descriptorOrInitializer.get;
            }
            if (descriptorOrInitializer.set) {
                propertyStash.set = descriptorOrInitializer.set;
            }
        } 
        // This version donot support set the default value.
        // else {
        //     this.setDefaultValue(
        //         classStash,
        //         propertyStash,
        //         target.constructor as new () => unknown,
        //         propertyKey,
        //         descriptorOrInitializer,
        //     );
        // }
        // 
        return propertyStash;
    }

    /**
     * 
     * @param obj 
     * @param key 
     * @returns 
     */
    static getSubDict<T, TKey extends keyof T> (obj: T, key: TKey): NonNullable<T[TKey]> {
        return obj[key] as NonNullable<T[TKey]> || ((obj[key]) = {} as NonNullable<T[TKey]>);
    }


    /**
     * 
     * @param decorate 
     * @returns 
     */
    static makeSmartClassDecorator<TArg> (
        decorate: <TFunction extends Function>(constructor: TFunction, ...arg: TArg[]) => ReturnType<ClassDecorator>,
    ): ClassDecorator & ((...arg: TArg[]) => ClassDecorator) {
        return proxyFn;
        function proxyFn(...args: Parameters<ClassDecorator>): ReturnType<ClassDecorator>;
        function proxyFn(arg?: TArg): ClassDecorator;
        function proxyFn (target?: Parameters<ClassDecorator>[0] | TArg): ReturnType<ClassDecorator> {
            
            const args:string|number[] = Array.from(arguments)
            if (typeof target === 'function') {
                // If no parameter specified
                return decorate(target);
            } else {
                return function <TFunction extends Function> (constructor: TFunction): void | Function {                    
                    // return decorate(constructor, target);
                    return decorate.apply(this, [constructor, ...args])
                };
            }
        }
    }
    // static makeSmartClassDecorator<TArg> (
    //     decorate: <TFunction extends Function>(constructor: TFunction, ...arg: TArg[]) => ReturnType<ClassDecorator>,
    // ): ClassDecorator & ((...arg: TArg[]) => ClassDecorator) {
    //     return proxyFn;
    //     function proxyFn(...args: Parameters<ClassDecorator>): ReturnType<ClassDecorator>;
    //     function proxyFn(arg?: TArg): ClassDecorator;
    //     function proxyFn (target?: Parameters<ClassDecorator>[0] | TArg): ReturnType<ClassDecorator> {
    //         if (typeof target === 'function') {
    //             // If no parameter specified
    //             return decorate(target);
    //         } else {
    //             return function <TFunction extends Function> (constructor: TFunction): void | Function {
    //                 return decorate(constructor, target);
    //             };
    //         }
    //     }
    // }

    /**
     * Tạo ra một loại decorate tính năng tương tự @property 
     * @param decoratorHandler 
     * @returns 
     */
    static generatePropertyDecorator(type:string, decoratorHandler:DecorateHandlerType):DecoratePropertyType{    
        // 
        const decorateFunc:Function = function (target?: Parameters<LegacyPropertyDecorator>[0] | PropertyType, 
            propertyKey?: Parameters<LegacyPropertyDecorator>[1],
            descriptorOrInitializer?: Parameters<LegacyPropertyDecorator>[2],
        ):LegacyPropertyDecorator | undefined{
            let options: IPropertyOptions | PropertyType | null = null;
            function normalized (
                target: Parameters<LegacyPropertyDecorator>[0],
                propertyKey: Parameters<LegacyPropertyDecorator>[1],
                descriptorOrInitializer: Parameters<LegacyPropertyDecorator>[2],
            ): void {
                // Create default property.
                const propertyNormalized:LegacyPropertyDecorator = property(options as __private._cocos_core_data_utils_attribute_defines__IExposedAttributes);
                propertyNormalized(target, propertyKey, descriptorOrInitializer);
                // 
                const classConstructor = target.constructor as new () => unknown;
                const classStash = CCEditor.getSubDict(classConstructor, CACHE_KEY as never);
                const propertyStash:PropertyStash = CCEditor.getOrCreatePropertyStash(
                    target,
                    propertyKey,
                );
                propertyStash.__$decorate = type;
                // 
                decoratorHandler(
                    classStash,
                    propertyStash,
                    classConstructor,
                    propertyKey,
                    options as IPropertyOptions,
                    descriptorOrInitializer
                );
            }
        
            if (target === undefined) {
                // @property() => LegacyPropertyDecorator
                return decorateFunc({
                    type: undefined,
                });
            } else if (typeof propertyKey === 'undefined') {
                // @property(options) => LegacyPropertyDescriptor
                // @property(type) => LegacyPropertyDescriptor
                options = target;
                return normalized;
            } else {
                // @property
                normalized(target as Parameters<LegacyPropertyDecorator>[0], propertyKey, descriptorOrInitializer);
                return undefined;
            }
        }
    
        return decorateFunc as DecoratePropertyType
    }

}


