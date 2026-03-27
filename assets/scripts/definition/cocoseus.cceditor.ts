
import { EDITOR } from "cc/env";
import { cocoseus_types } from "./cocoseus.types";
import { Asset, CCClass, Component, Constructor, Enum, js, _decorator, __private } from "cc";
import { cocoseus_utils } from "./cocoseus.utils";

type SimpleAssetInfo = cocoseus_types.SimpleAssetInfo;
type AssetMeta = cocoseus_types.AssetMeta;
type AssetInfo = cocoseus_types.AssetInfo;
type ReferenceInfo = cocoseus_types.ReferenceInfo;
type IPropertyOptions = cocoseus_types.IPropertyOptions;
type LegacyPropertyDecorator = cocoseus_types.LegacyPropertyDecorator;
type PropertyStash = cocoseus_types.PropertyStash;
type ClassStash = cocoseus_types.ClassStash;
type DecorateHandlerType = cocoseus_types.DecorateHandlerType;
type DecoratePropertyType = cocoseus_types.DecoratePropertyType;
type PropertyType = cocoseus_types.PropertyType;

const {property} = _decorator;
const StringUtil = cocoseus_utils.strings;
const DELIMETER:string = cocoseus_types.DELIMETER;
const CACHE_KEY:string = cocoseus_types.CACHE_KEY;

export namespace cocoseus_cceditor {

    /**
     * await Editor.Message.request('asset-db', 'query-asset-info', urlOrUUIDOrPath);
     * @param uuid 
     * @returns 
     */
    export async function getAssetInfo_Editor(uuid:string):Promise<SimpleAssetInfo>{
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
    export async function generateSimpleAssetInfoFromUrl_Editor(assetPath:string|null, simpleInfo?:SimpleAssetInfo, generator:Generator<string[]> = StringUtil.getPartialPath(assetPath)):Promise<SimpleAssetInfo|null>{
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
    export function getEditorPropertiesAtRuntime(fromComponent:Component, fillter?:(key:string, fullKey:string, attrs:any)=>boolean):string[]{
        const attrs:any = CCClass.Attr.getClassAttrs(fromComponent.constructor);
        const attrKeys:string[] = Object.keys(attrs);
        return attrKeys.reduce((results:string[], fullKey:string)=>{
            const splitKeyFeatures:any[] = fullKey.split(DELIMETER);
            const key:string = splitKeyFeatures[0];            
            if(key && (fillter ? fillter(key, fullKey, attrs) : true) ){
                const fullCtorKey:string = key+DELIMETER+'ctor';
                const fullTypeKey:string = key+DELIMETER+'type';
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
    export function getChildReferenceInfo(fromComponent:Component, fillter?:(key:string, fullKey:string, attrs:any)=>boolean):ReferenceInfo[]{   
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
    export async function getBundleName(asset:Asset):Promise<string>{
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
    export async function getSimpleAssetInfo(asset:Asset):Promise<SimpleAssetInfo>{
        return EDITOR && asset && asset.uuid ?  await this.getAssetInfo_Editor(asset.uuid) : null;
    }

    /**
     * 
     * @param targetObj 
     * @param propName 
     * @param newEnum 
     * @returns 
     */
    export function enumifyProperty (targetObj:object, propName:string , newEnum:unknown):any {
        let defaultEnum = Object.assign( Enum({}) , newEnum);
        Enum['update'](defaultEnum);
        this.setPropertyEnumType(targetObj, propName, defaultEnum);
        // CCClass["Attr"].setClassAttr(targetObj, propName, 'type', 'Enum');
        // CCClass["Attr"].setClassAttr(targetObj, propName, 'enumList', Enum["getList"](defaultEnum));
        return defaultEnum;
    }

    /**
     * 
     * @param objectOrConstructor 
     * @param propertyName 
     * @param enumType 
     */
    export function setPropertyEnumType (objectOrConstructor: object, propertyName: string, enumType: Record<string, string | number>): void { 
        const attrs: Record<string, any> = CCClass.Attr.getClassAttrs(objectOrConstructor);
        attrs[`${propertyName}${DELIMETER}type`] = 'Enum';
        attrs[`${propertyName}${DELIMETER}enumList`] = Enum.getList(enumType);
    }

    /**
     * 
     * @param objOrArray 
     * @returns 
     */
    export function convertToEnum(objOrArray:any):any{
        const enumDef: {[key: string]: number} = {};
        const names:string[] = Array.isArray(objOrArray) ? objOrArray : Object.keys(objOrArray);
        names.forEach((key:string, index:number)=>enumDef[key] = index)
        return Enum(enumDef)
    }

    /**
     * 
     * @param enumIndex 
     * @param enumType 
     * @returns 
     */
    export function findEnumKey(enumIndex:number, enumType:Record<string,string|number>):string{
        const names:string[] = Array.isArray(enumType) ? enumType : Object.keys(enumType);
        return names.find((key:string)=>key ? enumType[key] == enumIndex : false);
    }

    /**
     * 
     * @param targetObj 
     * @param propName 
     * @param propType 
     * @param value 
     */
    export function changeEditorProperty(targetObj:any, propName:string , displayName:string, classTypeName:string):any {        
        CCClass["Attr"].setClassAttr(targetObj, propName, 'type', 'Object');      
        CCClass["Attr"].setClassAttr(targetObj, propName, 'ctor', js.getClassByName(classTypeName));  
        CCClass["Attr"].setClassAttr(targetObj, propName, 'displayName', displayName);
    }

    
    /**
     * 
     * @param target 
     * @param propertyName 
     * @param option 
     * @param propertyDescriptor 
     */
    export function createEditorClassProperty(target:Record<string, any>, propertyName:string, option:IPropertyOptions, propertyDescriptor:PropertyDescriptor){ 
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
    export function extendClassCache<TStaticInjector>(constructor:TStaticInjector):TStaticInjector{
        try{
            let base = constructor['extends'] || js.getSuper(constructor as Constructor);
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
            // const classStash:ClassStash = constructor[CACHE_KEY] || (constructor[CACHE_KEY] ??= js.createMap());
            const classStash:ClassStash = constructor[CACHE_KEY] ? constructor[CACHE_KEY] : js.createMap();
            // classStash[CCCLASS_TAG] = undefined;
            constructor[CACHE_KEY] = js.mixin(classStash, cache);
        }catch(err){
            console.error('[Cocoseus Error] extendClassCache: ', err)
        }
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
    export function getOrCreatePropertyStash (
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
    export function getSubDict<T, TKey extends keyof T> (obj: T, key: TKey): NonNullable<T[TKey]> {
        return obj[key] as NonNullable<T[TKey]> || ((obj[key]) = {} as NonNullable<T[TKey]>);
    }


    /**
     * 
     * @param decorate 
     * @returns 
     */
    export function makeSmartClassDecorator<TArg> (
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
    

    /**
     * Tạo ra một loại decorate tính năng tương tự @property 
     * @param decoratorHandler 
     * @returns 
     */
    export function generatePropertyDecorator(decoratorType:string, decoratorHandler:DecorateHandlerType):DecoratePropertyType{    
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
                const classStash = getSubDict(classConstructor, CACHE_KEY as never);
                const propertyStash:PropertyStash = getOrCreatePropertyStash(
                    target,
                    propertyKey,
                );
                propertyStash.__$decorate = decoratorType || 'property';
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

