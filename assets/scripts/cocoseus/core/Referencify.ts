// Referencify

import { _decorator, Asset, AssetManager, Component, Constructor, director, Enum, error, find, js, log} from "cc";
import { BabelPropertyDecoratorDescriptor, IPropertyOptions, ReferenceInfo, IReferencified, LegacyPropertyDecorator, PropertyType, IStaticReferencified } from "../types/CoreType";
import { Support } from "../utils/Support";
import Decoratify from "./Decoratify";
import { CACHE_KEY, Inheritancify, lastInjector } from "./Inheritancify";
import Storagify from "./Storagify";
import { EDITOR } from "cc/env";
import { CCEditor, SimpleAssetInfo } from "../utils/CCEditor";
const { property } = _decorator;
// const {Editor} = globalThis
let ReferenceEnum = Enum({Default:-1});

// globalThis.Editor.Message.addBroadcastListener('console:logsUpdate', () => {log('-------------------- ????????')});

export const ENUM_PROPERTY_PREFIX:string = '__$enum__';
export const INDEX_PROPERTY_PREFIX:string = '__$id__';
export const STRING_PROPERTY_PREFIX:string = '__$string__';
export const INFO_PROPERTY_PREFIX:string = '__$info__';
export const WRAPPER_PROPERTY_PREFIX:string = '__$';



/**
 * 
 * @param base 
 * @returns 
 */
export default Inheritancify<IReferencified, IStaticReferencified>(function Referencify <TBase>(base:Constructor<TBase>):Constructor<TBase & IReferencified>{             
    class Referencified extends Storagify(Decoratify(base as unknown as Constructor<Component>)) implements IReferencified {
        
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
            const refPaths:string[] = [];
            const comps:IReferencified[] = [];
            Referencified.keys.forEach((value:string, token:number)=>{
                refPaths.push(Referencified.getRefPath(token));
                comps.push(Referencified.getComponent(token));
            })
            // 
            const ReferenceEnum:any = Support.convertToEnum(refPaths);            
            comps.forEach((serachComp:IReferencified)=>{
                serachComp.updateReferenceEnum(ReferenceEnum);
            })

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
            if(!EDITOR){
                this.references.delete(comp.token);
                this.keys.delete(comp.token);
            }else{
                // globalThis.Editor.Message.request('scene', 'query-component', comp.node.uuid).then((val)=>{
                //     log('KKKKKKKKK:: ' + val)
                // });
                log('Scene:: ' + director.getScene().name)
                
            }
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

        // ---------------

        /**
         * 
         */
        public get internalOnLoad (): (() => void) | undefined {
            Referencified.register(this);            
            return super['internalOnLoad']
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
        updateReferenceEnum(enumData:any):void{            
            const propertyNames:string[] = Array.from( Decoratify(this).keys('@reference'));
            propertyNames.forEach((propName:string)=>{
                const enumPropertyName:any = ENUM_PROPERTY_PREFIX + propName;
                CCEditor.enumifyProperty(this, enumPropertyName, enumData);
            })
        }

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
        // const enumPropertyName:any = ENUM_PROPERTY_PREFIX + propertyName;
        // const underlinePropertyName:any = WRAPPER_PROPERTY_PREFIX + propertyName;
        // const infoPropertyName:any = INFO_PROPERTY_PREFIX + propertyName;
        // 
        Decoratify(target).record(propertyName, '@reference');
        // // 
        // const constructor:any = target.constructor;
        // const classStash:unknown = constructor[CACHE_KEY] || ((constructor[CACHE_KEY]) = {});
        // const ccclassProto:unknown = classStash['proto'] || ((classStash['proto'])={});
        // const properties:unknown = ccclassProto['properties'] || ((ccclassProto['properties'])={});
        // const propertyStash:unknown = properties[propertyName] ??= {};    
        // const infoPropertyStash:unknown = properties[infoPropertyName] ??= {};    
        // const underlinePropertyStash:unknown = properties[underlinePropertyName] ??= {};    
        // const enumPropertyStash:unknown = properties[enumPropertyName] ??= {};    
        // // 
        // js.mixin(infoPropertyStash, {serializable:true, visible:false})
        // js.mixin(underlinePropertyStash, {serializable:true, visible:false})
        // // 
        // js.mixin(propertyStash, {
        //     displayName: Support.upperFirstCharacter(propertyName),
        //     visible(){
        //         return !this[infoPropertyName]
        //     }
        // });
        // js.mixin(enumPropertyStash, {
        //     type:Enum({NONE:0}),
        //     displayName: Support.upperFirstCharacter(enumPropertyName),
        //     visible(){
        //         return !!this[infoPropertyName]
        //     }
        // });
        
        

        // 
        if(!options){
            options = {};
        };

        defineSmartProperty(target, propertyName, options, descriptorOrInitializer);

        // if(!(options as IPropertyOptions).type){
        //     // (options as IPropertyOptions).type = ReferenceEnum;
        //     (options as IPropertyOptions).visible = function(){return true};
        //     (options as IPropertyOptions).displayName = ''+ propertyName.replace(/\b\w/g, c => c.toUpperCase()).replace(/(?=[A-Z])/g,' ')+'';  // upper first character
        // }
        // ((options ??= {}) as IPropertyOptions).type = Component;

        // Ẩn thuộc tính chính, chỉ dùng để lưu trữ.
        // (options as IPropertyOptions).visible = false;
        // const propertyNormalized:LegacyPropertyDecorator = property(options);
        // propertyNormalized(target as Parameters<LegacyPropertyDecorator>[0], propertyName, descriptorOrInitializer);        
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
function defineSmartProperty(target:Parameters<LegacyPropertyDecorator>[0], propertyName:string, options:IPropertyOptions, descriptorOrInitializer:  BabelPropertyDecoratorDescriptor){
    const enumPropertyName:any = ENUM_PROPERTY_PREFIX + propertyName;
    const wrapperPropertyName:any = WRAPPER_PROPERTY_PREFIX + propertyName;
    const infoPropertyName:any = INFO_PROPERTY_PREFIX + propertyName;   
    // 
    if(!options){
        options = {};
    }
    
    // Record info -------------
    Object.defineProperty(target, infoPropertyName, {value:null, writable:true});

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
    Object.defineProperty(target, enumPropertyName, enumPropetyDescriptor);
    const enumOption:IPropertyOptions = {
        type:Enum({NONE:0}),
        displayName:Support.upperFirstCharacter(propertyName),
        visible(){
            return true//!!this[infoPropertyName]
        }
    }
    const enumPropertyNormalized:LegacyPropertyDecorator = property(enumOption);
    enumPropertyNormalized(target as Parameters<LegacyPropertyDecorator>[0], wrapperPropertyName, enumPropetyDescriptor);
    // ------------------------------ end Define Enum

    // Define Wrapper ------------------------------
    const wrapperDescriptor:PropertyDescriptor = {
        get():Asset{                
            if(this[infoPropertyName]){
                CCEditor.enumifyProperty(this, enumPropertyName, Support.convertToEnum(['REMOVE', this[infoPropertyName]?.url]))
            }
            return this[propertyName];
        },
        set:async function(asset:Asset){           
            if(EDITOR && !!asset){
                const assetInfo:SimpleAssetInfo = await CCEditor.getAssetInfo(asset);
                const bundleName:string = assetInfo.bundle;            
                if( bundleName !== AssetManager.BuiltinBundleName.INTERNAL &&
                    bundleName !== AssetManager.BuiltinBundleName.MAIN  &&
                    bundleName !== AssetManager.BuiltinBundleName.START_SCENE){
                    // 
                    this[infoPropertyName] = assetInfo;
                    CCEditor.enumifyProperty(this, enumPropertyName, Support.convertToEnum(['REMOVE', this[infoPropertyName]?.url]))
                    // 
                }               
            }     
            this[propertyName] = asset;       
        },
        configurable: descriptorOrInitializer.configurable,
        enumerable: descriptorOrInitializer.enumerable,
        // writable: descriptorOrInitializer.writable,        
    } as PropertyDescriptor;
    
    Object.defineProperty(target, wrapperPropertyName, wrapperDescriptor);

    const wrapperOption:IPropertyOptions = Object.assign({}, options, {
        displayName:Support.upperFirstCharacter(propertyName),
        visible(){
            return !this[infoPropertyName]
        }
    }) as IPropertyOptions
    const wrapperPropertyNormalized:LegacyPropertyDecorator = property(wrapperOption);
    wrapperPropertyNormalized(target as Parameters<LegacyPropertyDecorator>[0], wrapperPropertyName, wrapperDescriptor);
    // ------------------------------------- end Define Wrapper

    // Current property ---------------
    (options as IPropertyOptions).visible = false;
    const propertyNormalized:LegacyPropertyDecorator = property(options);
    propertyNormalized(target as Parameters<LegacyPropertyDecorator>[0], propertyName, descriptorOrInitializer);
}


// async function checkForEmbedingOrLoading(target: Parameters<LegacyPropertyDecorator>[0], propertyName:string, asset:Asset, ){
//     if(EDITOR && !!asset){
//         const assetInfo:SimpleAssetInfo = await CCEditor.getAssetInfo(asset);
//         const bundleName:string = assetInfo.bundle;            
//         if( bundleName !== AssetManager.BuiltinBundleName.INTERNAL &&
//             bundleName !== AssetManager.BuiltinBundleName.MAIN  &&
//             bundleName !== AssetManager.BuiltinBundleName.START_SCENE){
//             // 
//             const infoPropertyName:any = INFO_PROPERTY_PREFIX + propertyName;
//             const enumPropertyName:any = ENUM_PROPERTY_PREFIX + propertyName;
//             this[infoPropertyName] = assetInfo;
//             CCEditor.enumifyProperty(this, enumPropertyName, Support.convertToEnum(['REMOVE', assetInfo.url]))
//             // 
//         }else{
//             const underlinePropertyName:any = UNDERLINE_PROPERTY_PREFIX + propertyName;
//             this[underlinePropertyName] = asset;
//         }                
//     }        
// }