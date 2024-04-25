// Referencify

import { _decorator, Component, Constructor } from "cc";
import { BabelPropertyDecoratorDescriptor, IPropertyOptions, ReferenceInfo, IReferencified, LegacyPropertyDecorator, PropertyType, IStaticReferencified } from "../types/ModifierType";
import { Support } from "../utils/Support";
import Decoratify from "./Decoratify";
import { Inheritancify } from "./Inheritancify";
import Storagify from "./Storagify";
const { property } = _decorator;


/**
 * 
 * @param base 
 * @returns 
 */
export default Inheritancify<IReferencified, IStaticReferencified>(function Referencify <TBase>(base:Constructor<TBase>):Constructor<TBase & IReferencified>{             
    class Referencified extends Storagify(Decoratify(base as unknown as Constructor<Component>)) implements IReferencified {
        // static _ENUM:any
        // static get ENUM():any{
        //     if(EDITOR){
        //         const storage:Map<number, ReferenceInfo> = getModifierStorage<ReferenceInfo>(Referencify.name);
        //         const arrayList:string[] = [...storage.values()].reduce((refList:string[], info:ReferenceInfo, index:number)=>{
        //             if(info){
        //                 refList[index] = info.comp + '<' + info.node + '>' + (!!info.id ? '(' + info.id+ ')' : '');
        //             }
        //             return refList
        //         },[])
        //         return convertToEnum(arrayList);
        //     }
        //     return Enum({default:-1})
        // }
        protected _refInfo:ReferenceInfo;

        protected _refKey:number = -1

        protected _references:Map<number, ReferenceInfo>;

        protected genKey(info:ReferenceInfo):string{
            return Support.tokenize(info.node) + '.' + Support.tokenize(info.comp) + '.' + Support.tokenize(info.id.toString())
        }

        protected get references(){
            if(!this._references){
                this._references = Storagify(this).table<ReferenceInfo>(Referencify.name)
            }
            return this._references
        }

        /**
         * 
         */
        public get internalOnLoad (): (() => void) | undefined {
            this.references.set(this.refKey, this.refInfo);
            // 
            return super['internalOnLoad']
        }

        get refKey():number{
            if(this._refKey == -1){
                this._refKey = Support.tokenize(this.refInfo.node, this.refInfo.comp, this.refInfo.id.toString());
            }
            return this._refKey
        }

        get refInfo():ReferenceInfo{
            if(this.node && !this._refInfo){
                const hierachyPath:string = this.node.getPathInHierarchy();
                const compName:string = this.constructor.name;
                const orderIndex:number = this.node.getComponents(compName).findIndex((_comp:Component)=>_comp === this)||0;
                // const modifierToken:number = Support.tokenize(Referencify.name)
                // const referenceToken:number = Support.tokenize(hierachyPath, compName, orderIndex.toString());
                this._refInfo = {
                    node:hierachyPath,
                    comp:compName,
                    id:orderIndex
                }                
            }
            return this._refInfo
        }

        test(): void {
            
        }
    }
    return Referencified as unknown as Constructor<TBase & IReferencified>;

}) 



// ----------- Decorator ------------

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
        Decoratify(target).record(propertyKey.toString(), '@reference')
        // 
        if(!options){
            options = {};
        }
        if(!(options as IPropertyOptions).type){
            (options as IPropertyOptions).type = Component;
        }
        // ((options ??= {}) as IPropertyOptions).type = Component;
        const propertyNormalized:LegacyPropertyDecorator = property(options);
        propertyNormalized(target as Parameters<LegacyPropertyDecorator>[0], propertyKey, descriptorOrInitializer);
        return descriptorOrInitializer
    }

    if (target === undefined) {
        // @audio() => LegacyPropertyDecorator
        return reference({
            type: Decoratify,
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