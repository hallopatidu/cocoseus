// Referencify

import { _decorator, Component, Constructor, director, Enum, find, js, log, SceneGlobals, sys, warn } from "cc";
import { BabelPropertyDecoratorDescriptor, IPropertyOptions, ReferenceInfo, IReferencified, LegacyPropertyDecorator, PropertyType, IStaticReferencified } from "../types/CoreType";
import { Support } from "../utils/Support";
import Decoratify from "./Decoratify";
import { CACHE_KEY, ENUM_PROPERTY_PREFIX, INDEX_PROPERTY_PREFIX, Inheritancify, lastInjector, STRING_PROPERTY_PREFIX } from "./Inheritancify";
import Storagify from "./Storagify";
import { EDITOR } from "cc/env";
const { property } = _decorator;
// const {Editor} = globalThis
let ReferenceEnum = Enum({Default:-1});

globalThis.Editor.Message.addBroadcastListener('console:logsUpdate', () => {log('-------------------- ????????')});

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
            return info.node.split('/').map(nodeName=> Support.tokenize(nodeName)).join('.').toString() + '.' + Support.tokenize(info.comp) + '.' + Support.tokenize(info.id.toString())
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
            let refPaths:string[] = [];
            Referencified.keys.forEach((value:string, token:number)=>{
                // const compPath:string = Referencified.getRefPath(token);
                refPaths.push(Referencified.getRefPath(token))
            })
            // log('>>>>>>> ' + refPaths)
            ReferenceEnum = Support.convertToEnum(refPaths);
            
            const propertyNames:string[] = Array.from( Decoratify(comp).keys('@reference'));
            propertyNames.forEach((propName:string)=>{
                const enumPropertyName:any = ENUM_PROPERTY_PREFIX + propName;
                Support.enumifyProperty(comp, enumPropertyName, ReferenceEnum);
                // propName && log(comp.node.name + ' Enum >> ------------------ ' + propName + '' + ReferenceEnum)
            })
            
            if(EDITOR){ 
                // globalThis.Editor.Message.request('scene', 'query-components').then((value:any)=>{
                //     // log('value:: ' + value)
                // });
                // globalThis.Editor.Message.request('scene', 'query-component').then((value:any)=>{
                //     // log('value:: ' + value)
                // });
                globalThis.Editor.Message.request('scene', 'query-components', 'cc.Sprite').then((...args)=>{
                    log('Component class ' + args)
                });
                // 
                globalThis.Editor.Message.addBroadcastListener('console:logsUpdate', function(val){
                    log('Remove ====>>>>   ' + val)
                })
                // 
            }

            const json:string = JSON.stringify(Array.from(this.references)); 
            const map:Map<any,any> = new Map(JSON.parse(json));
            // scene:component-removed
            log('All:: ' + json) ;
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
            return '[' + refInfo?.comp + ']<' + refInfo?.node + '>' + (refInfo.id ? '(' +refInfo.id+')' : '' );
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

        // ---------------

        // ---------------

        /**
         * 
         */
        public get internalOnLoad (): (() => void) | undefined {
            Referencified.register(this);
            this.implementReferences()
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
                // this._token = Support.tokenize(this.refInfo.node, this.refInfo.comp, this.refInfo.id.toString());
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
                    node:hierachyPath,
                    comp:compName,
                    id:orderIndex
                }
            }
            return this._refInfo
        }

        /**
         * 
         */
        protected implementReferences(){            
            // log('\n ------------------- ' + this.node.getPathInHierarchy());
            // log('Token ' + Referencified.findToken(this.node.getPathInHierarchy()))
            // let refPaths:string[] = []
            // Referencified.keys.forEach((value:string, token:number)=>{
            //     refPaths.push(Referencified.getRefPath(token))
            // })
            // log(Object.keys(refPaths))
            // const allProperties:string[] = Decoratify(this).keys('@reference');
            // allProperties.forEach((propName:string)=>{

            // })
            // Referencified.
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
        // Truy xuất vào Injector cua mot prototype
        Decoratify(target).record(propertyKey.toString(), '@reference');
        // lastInjector<IStaticReferencified>(target).findToken()
        const constructor:any = target.constructor;  
        const propertyName:string = propertyKey.toString();
        const enumPropertyName:any = ENUM_PROPERTY_PREFIX + propertyName;
        const indexEnumPropertyName:any = INDEX_PROPERTY_PREFIX + propertyName;
        const stringPropertyName:any = STRING_PROPERTY_PREFIX + propertyName;
        // // 
        // const classStash:unknown = constructor[CACHE_KEY] || ((constructor[CACHE_KEY]) = {});
        // const ccclassProto:unknown = classStash['proto'] || ((classStash['proto'])={});
        // const properties:unknown = ccclassProto['properties'] || ((ccclassProto['properties'])={});
        // const enumPropertyStash:unknown = properties[enumPropertyName] ??= {};    
        // // 
        // const enumPropertyRecordOptions:any = {            
        //     displayName: ''+ propertyName.replace(/\b\w/g, c => c.toUpperCase()).replace(/(?=[A-Z])/g,' ')+'',  // upper first character
        //     // visible:true
        // }
        
        // const enumPropertyRecord:any = js.mixin(enumPropertyStash, enumPropertyRecordOptions);
        Object.defineProperty(target, enumPropertyName, {
            get:function():number{                
                return !this[indexEnumPropertyName] || this[indexEnumPropertyName] == -1 ? 0 :this[indexEnumPropertyName];
            },
            set:function(val:number){           
                this[indexEnumPropertyName] = val;     

                
            }
        });
        // 
        if(!options){
            options = {};
        }
        if(!(options as IPropertyOptions).type){
            // (options as IPropertyOptions).type = ReferenceEnum;
            (options as IPropertyOptions).visible = function(){return true};
            (options as IPropertyOptions).displayName = ''+ propertyName.replace(/\b\w/g, c => c.toUpperCase()).replace(/(?=[A-Z])/g,' ')+'';  // upper first character
        }
        // ((options ??= {}) as IPropertyOptions).type = Component;
        const propertyNormalized:LegacyPropertyDecorator = property(options);
        // propertyNormalized(target as Parameters<LegacyPropertyDecorator>[0], propertyKey, descriptorOrInitializer);
        propertyNormalized(target as Parameters<LegacyPropertyDecorator>[0], enumPropertyName, descriptorOrInitializer);
        return descriptorOrInitializer
    }
    

    if (target === undefined) {
        // @audio() => LegacyPropertyDecorator
        return reference({
            type: ReferenceEnum,
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