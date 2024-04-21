// Referencify

import { _decorator, Component, Constructor, Enum, js, warn } from "cc";
import { convertToEnum, getModifierStorage, getTokenSet, Modifierify, ModifierStorage } from "./Modifierify"
import { BabelPropertyDecoratorDescriptor, IPropertyOptions, ReferenceInfo, IReferencified, LegacyPropertyDecorator, PropertyType, ModifierMethod } from "../types/ModifierType";
import { Support } from "../utils/Support";
import { EDITOR } from "cc/env";
import Decoratify from "./Decoratify";
const { property } = _decorator;


/**
 * 
 * @param base 
 * @returns 
 */
export default Modifierify<IReferencified, ReferenceInfo>(function Referencify <TBase>(base:Constructor<TBase>):Constructor<TBase & IReferencified>{             
    class Referencified extends (base as unknown as Constructor<Component>) implements IReferencified {
        static _ENUM:any
        static get ENUM():any{
            if(EDITOR){
                const storage:Map<number, ReferenceInfo> = getModifierStorage<ReferenceInfo>(Referencify.name);
                const arrayList:string[] = [...storage.values()].reduce((refList:string[], info:ReferenceInfo, index:number)=>{
                    if(info){
                        refList[index] = info.comp + '<' + info.node + '>' + (!!info.id ? '(' + info.id+ ')' : '');
                    }
                    return refList
                },[])
                return convertToEnum(arrayList);
            }
            return Enum({default:-1})
        }

        

        public get internalOnLoad (): (() => void) | undefined {
            // 
            if(this.node){
                const hierachyPath:string = this.node.getPathInHierarchy();
                const compName:string = this.constructor.name;
                const orderIndex:number = this.node.getComponents(compName).findIndex((_comp:Component)=>_comp === this)||0;
                const modifierToken:number = Support.tokenize(Referencify.name)
                const referenceToken:number = Support.tokenize(hierachyPath, compName, orderIndex.toString());
                // 
                
                // (this as IReferencified).recordTokenData<ReferenceInfo>(modifierToken, referenceToken, {
                //     node:hierachyPath,
                //     comp:compName,
                //     id:orderIndex
                // } as ReferenceInfo)
            }
            // 
            return super['internalOnLoad']
        }
        test(): void {
            
        }
    }


    return Referencified as unknown as Constructor<TBase & IReferencified>
    // return Referencified as unknown as Constructor<TBase & IReferencified>
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
        const className:string = target.name;
        // storage(Decoratify).record()
        const storage:ModifierStorage<string> = target.storage as ModifierStorage<string>;
        storage.record<string>(className, propertyKey.toString());
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