// Referencify

import { _decorator, Asset, assetManager, AssetManager, CCObject, Component, Constructor, director, Enum, error, find, js, log, Prefab, warn} from "cc";
import { BabelPropertyDecoratorDescriptor, IPropertyOptions, ReferenceInfo, IReferencified, LegacyPropertyDecorator, PropertyType, IStaticReferencified, IAsyncProcessified } from "../types/CoreType";
import { Support } from "../utils/Support";
import Decoratify from "./Decoratify";
import { CACHE_KEY, Inheritancify, lastInjector } from "./Inheritancify";
import Storagify from "./Storagify";
import { DEV, EDITOR } from "cc/env";
import { CCEditor, SimpleAssetInfo } from "../utils/CCEditor";
import AsyncProcessify from "./AsyncProcessify";
const { property } = _decorator;
// const {Editor} = globalThis
let ReferenceEnum = Enum({Default:-1});

// globalThis.Editor.Message.addBroadcastListener('console:logsUpdate', () => {log('-------------------- ????????')});

export const ENUM_PROPERTY_PREFIX:string = '__$enum__';
export const INDEX_PROPERTY_PREFIX:string = '__$id__';
export const STRING_PROPERTY_PREFIX:string = '__$string__';
export const INFO_PROPERTY_PREFIX:string = '__$info__';
export const WRAPPER_PROPERTY_PREFIX:string = '__$';

enum ClassType {
    ASSET,
    COMPONENT,
    NODE
}

/**
 * 
 * @param base 
 * @returns 
 */
export default Inheritancify<IReferencified, IStaticReferencified>(function Referencify <TBase>(base:Constructor<TBase>):Constructor<TBase & IReferencified>{             
    class Referencified extends Storagify(Decoratify( AsyncProcessify( base as unknown as Constructor<Component>) ) ) implements IReferencified {
        
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
            return (info.scene ? Support.tokenize(info.scene) + '.' : '') + Support.pathToToken(info.node) + '.' + Support.tokenize(info.comp) + '.' + Support.tokenize(info.id.toString())
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
            // 
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
            return '[' + refInfo?.comp + ']' + (refInfo.id ? '(' +refInfo.id+')' : '' ) + '<' + refInfo?.node + '>' + '%' + refInfo.scene + '%';
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

        // --------------- PRIVATE --------------

        /**
         * 
         */
        private async startLoadingAssets(){
            const propertyNames:string[] = Array.from( Decoratify(this).keys('@reference.load'));
            if(propertyNames && propertyNames.length){
                const thisAsyncLoading:IAsyncProcessified = this as unknown as IAsyncProcessified;
                thisAsyncLoading.begin(-1);                
                // 
                const promises:Promise<any>[] = []
                propertyNames.forEach((propName:string)=>{
                    const propArr:string[] = propName?.split("::");
                    if(propArr && propArr.length){                    
                        const propertyName:string = propArr[0];
                        const classTypeName:string = propArr[1];
                        const classType:any = js.getClassByName(classTypeName);
                        const assetInfo:SimpleAssetInfo = this[INFO_PROPERTY_PREFIX + propertyName];
                        if(propertyName && classType && assetInfo){                            
                            promises.push(new Promise(async (resolve:Function)=>{
                                const asset:Asset = await loadAsset(assetInfo, classType);
                                this[propertyName] = asset;
                                resolve(asset);
                            }) )

                        }else{
                            DEV && error('Unload ' + propertyName)
                        }
                    }
                });
                await Promise.all(promises);
                // 
                thisAsyncLoading.end(-1);
            }
        }


        // ---------------

        /**
         * 
         */
        public get internalOnStart (): (() => void) | undefined {
            return async ()=>{
                await (this as unknown as IAsyncProcessified).wait(-1);
                super['internalOnStart'] && super['internalOnStart']()
            }
            // return super['internalOnStart']
        }

        /**
         * 
         */
        public get internalOnLoad (): (() => void) | undefined {
            Referencified.register(this); 
            this.startLoadingAssets();
            return async ()=>{
                await (this as unknown as IAsyncProcessified).wait(-1);
                super['internalOnLoad'] && super['internalOnLoad']()
            }
            // return super['internalOnLoad']
        }

        /**
         * 
         */
        public get internalOnDisable (): (() => void) | undefined {
            Referencified.remove(this);
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
                    scene:director.getScene().name,
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
        const propertyType:ClassType = detechBaseCCObject((options as IPropertyOptions).type);
        switch(propertyType){
            case ClassType.ASSET:
                defineSmartProperty(target, propertyName, options, descriptorOrInitializer);
                // 
                const classType:string = getClassName((options as IPropertyOptions).type);
                Decoratify(target).record(propertyName + (classType ? "::" + classType : ""), '@reference.load');
                break;
            // case ClassType.NODE:
            //     CCEditor.createEditorProperty(target, propertyName, options, descriptorOrInitializer);
            //     break;
            // case ClassType.COMPONENT:
            //     CCEditor.createEditorProperty(target, propertyName, options, descriptorOrInitializer);
            //     break;
            default:
                CCEditor.createEditorProperty(target, propertyName, options, descriptorOrInitializer);
                break;
        }   
        Decoratify(target).record(propertyName, '@reference');
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
    // 
    // Record info -------------
    const infoPropertyDescriptor:PropertyDescriptor = {value:null, writable:true}    
    const infoOption:IPropertyOptions = {serializable:true, visible:false};
    CCEditor.createEditorProperty(target, infoPropertyName,infoOption, infoPropertyDescriptor);
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
    CCEditor.createEditorProperty(target, enumPropertyName, enumOption, enumPropetyDescriptor);
    // ------------------------------ end Define Enum

    
    // Define Wrapper ------------------------------
    const wrapperDescriptor:PropertyDescriptor = {
        get():Asset{                
            if(this[infoPropertyName]){
                const assetPath:string = '[' + this[infoPropertyName]?.bundle + '] ' + this[infoPropertyName]?.url
                CCEditor.enumifyProperty(this, enumPropertyName, Support.convertToEnum(['REMOVE', assetPath]))
            }
            return this[propertyName];
        },
        set:async function(asset:Asset){           
            if(EDITOR && !!asset){
                const assetInfo:SimpleAssetInfo = await CCEditor.getAssetInfo(asset);
                const bundleName:string = assetInfo.bundle;
                log('bundle name ' + bundleName)            
                if( !!bundleName &&
                    bundleName !== AssetManager.BuiltinBundleName.INTERNAL &&
                    bundleName !== AssetManager.BuiltinBundleName.MAIN  &&
                    bundleName !== AssetManager.BuiltinBundleName.START_SCENE){
                    // 
                    this[infoPropertyName] = assetInfo;
                    const assetPath:string = '[' + this[infoPropertyName]?.bundle + '] ' + this[infoPropertyName]?.url;
                    CCEditor.enumifyProperty(this, enumPropertyName, Support.convertToEnum(['REMOVE', assetPath]))
                    // 
                }
            }     
            this[propertyName] = asset;       
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
    CCEditor.createEditorProperty(target, wrapperPropertyName, wrapperOption, wrapperDescriptor)
    // ------------------------------------- end Define Wrapper
    
    // Current property ---------------
    if(!!options){
        (options as IPropertyOptions).visible = false;
        (options as IPropertyOptions).serializable = false;    
    }
    CCEditor.createEditorProperty(target, propertyName, options, descriptorOrInitializer);
    
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
        }
    }
    return null;
}

// type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

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
                        DEV && error('Prefab Loading Error: ' + assetPath + ' with bundle: ' + bundle.name + ' -node ' + this.node.getPathInHierarchy() )       
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