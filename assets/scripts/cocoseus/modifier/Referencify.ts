// Referencify

import { _decorator, Component, Constructor, warn } from "cc";
import { getInstanceTokenSet, hasModifierImplement } from "./Inheritancify"
import { BabelPropertyDecoratorDescriptor, IPropertyOptions, IReferenceInfo, IReferencified, LegacyPropertyDecorator, PropertyType } from "../types/ModifierType";
import { Support } from "../utils/Support";
const { property } = _decorator;

export const ModifierName:string = 'Referencified';


const ReferenceStorage:Map<number, IReferenceInfo> = new Map<number, IReferenceInfo>();

/**
 * 
 * @param comp 
 * @returns token of record
 */
function referenceRegister(comp:Component):number{
    const constructor:any = comp.constructor;
    if(comp.node){
        const hierachyPath:string = comp.node.getPathInHierarchy();
        const compName:string = constructor.name;
        const orderIndex:number = comp.node.getComponents(constructor).findIndex((_comp:Component)=>_comp === comp)||0;
        // 
        const token:number = Support.tokenize(hierachyPath, compName, orderIndex.toString());
        if(!ReferenceStorage.has(token)){
            const refInfo:IReferenceInfo = {
                node:hierachyPath,
                comp:compName,
                id:orderIndex
            } as IReferenceInfo
            ReferenceStorage.set(token, refInfo);
            const tokenSet:Set<number> = getInstanceTokenSet(comp, Referencify.TOKEN);
            !tokenSet.has(token) && tokenSet.add(token);
        }else{
            warn('Reference is declared')            
        }
        return token
    }
    return -1;
}

/**
 * <TSuper,TBase = Component>
 * @param base 
 * @returns 
 */
export default function Referencify<TBase>(base:Constructor<TBase>):Constructor<TBase & IReferencified>{   
    if(hasModifierImplement(base, Referencify.NAME)){
        return base as unknown as any
    }else{        
        class Referencified extends (base as unknown as Constructor<Component>) implements IReferencified {            
            public get internalOnLoad (): (() => void) | undefined {
                referenceRegister(this)
                return super['internalOnLoad']
            }
        }
        return Referencified as unknown as Constructor<TBase & IReferencified>
    }
    // return (hasModifierImplement(base, ModifierName) ? base : remakeClassInheritance(base, OneFlowComponent, Component)) as unknown as Constructor<TBase & IOneFlowified>
}

Referencify.TOKEN =  Symbol();
Referencify.NAME =  'Referencified';

// ----------- Decorator ------------

/**
 * '@audio'             Developer can choose a Sound in all of AudioReference exist in Scene at that time. Using default AudioReference.Enum 
 * '@audio(String)'     The developer defines a key of a specific AudioReference. Sound could not be played if this AudioReference is not exist.
 * '@audio(Enum)'       Developer can choose a Sound in Enum list.
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
        ((options ??= {}) as IPropertyOptions).type = Component;
        const propertyNormalized:LegacyPropertyDecorator = property(options);
        propertyNormalized(target as Parameters<LegacyPropertyDecorator>[0], propertyKey, descriptorOrInitializer);
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