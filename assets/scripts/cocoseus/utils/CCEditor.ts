import { _decorator, Asset, CCClass, Component, Constructor, Enum, js, Node } from 'cc';
import { EDITOR } from 'cc/env';
import { Support } from './Support';
import { IPropertyOptions, LegacyPropertyDecorator, PropertyStash, PropertyType, SimpleAssetInfo } from '../types/CoreType';

const { ccclass, property } = _decorator;

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

    static async getSimpleAssetInfo(asset:Asset):Promise<SimpleAssetInfo>{
        return EDITOR && asset && asset.uuid ?  await this.getAssetInfo_Editor(asset.uuid) : null;
    }

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
    // 


    static getSubDict<T, TKey extends keyof T> (obj: T, key: TKey): NonNullable<T[TKey]> {
        return obj[key] as NonNullable<T[TKey]> || ((obj[key]) = {} as NonNullable<T[TKey]>);
    }

    static makeSmartClassDecorator<TArg> (
        decorate: <TFunction extends Function>(constructor: TFunction, arg?: TArg) => ReturnType<ClassDecorator>,
    ): ClassDecorator & ((arg?: TArg) => ClassDecorator) {
        return proxyFn;
        function proxyFn(...args: Parameters<ClassDecorator>): ReturnType<ClassDecorator>;
        function proxyFn(arg?: TArg): ClassDecorator;
        function proxyFn (target?: Parameters<ClassDecorator>[0] | TArg): ReturnType<ClassDecorator> {
            if (typeof target === 'function') {
                // If no parameter specified
                return decorate(target);
            } else {
                return function <TFunction extends Function> (constructor: TFunction): void | Function {
                    return decorate(constructor, target);
                };
            }
        }
    }

    // static extendClassCache(constructor:Constructor, base:Constructor){
    //     // Apply to all @property decorator.
    //     const cache = base[CACHE_KEY];    
    //     if (cache) {
    //         const decoratedProto = cache.proto;
    //         if (decoratedProto) {
    //             const properties:Record<string, any> = decoratedProto.properties;
    //             // 
    //             constructor[CACHE_KEY] = js.createMap();
    //             const classStash:unknown = constructor[CACHE_KEY] || ((constructor[CACHE_KEY]) ??= {});
    //             const ccclassProto:unknown = classStash['proto'] || ((classStash['proto'])??={});
    //             const injectorProperties:unknown = ccclassProto['properties'] || ((ccclassProto['properties'])??={});
    //             // 
    //             const keys:string[] = Object.keys(properties);
    //             keys.forEach((propertyName:string)=>{
    //                 const propertyStash:PropertyStash = injectorProperties[propertyName] ??= {};
    //                 js.mixin(propertyStash, properties[propertyName]);
    //                 // remakeProperty(constructor, propertyName, injectorProperties);
    //             })            
    //         }
    //         base[CACHE_KEY] = undefined;
    //     }
    // }

    /**
     * 
     * @param target 
     * @param functionName 
     * @param functionMethod 
     */
    // static overrideClassMethod(target:Record<string, any>, functionName:string, functionMethod:(superMethod:Function)=>{}){
    //     const prototype = target.prototype ? target.prototype : target;
    //     if(Object.prototype.hasOwnProperty.call(prototype, 'onLoad')){
    //         const lastMethod:Function = prototype[functionName];            
    //         js.value(prototype, functionName, function(){
    //             functionMethod.bind(this, lastMethod);
    //         })
    //     }
    // }

}


