import { DEV } from "cc/env";
import { hasModifierImplement, remakeClassInheritance, mixinClass } from "./Inheritancify";
import { Component, Constructor, Enum, _decorator, error } from "cc";
import { Action, BabelPropertyDecoratorDescriptor, IOneFlowified, IPropertyOptions, LegacyPropertyDecorator, PropertyType } from "../types/ModifierType";
const { ccclass, property } = _decorator;

export const ModifierName:string = 'OneFlowComponent';

@ccclass('OneFlowComponent')
export class OneFlowComponent extends Component implements IOneFlowified{
    dispatch(action:Action, ...receiver:string[]):void {
        
    }

    wait(){

    }
}

/**
 * <TSuper,TBase = Component>
 * @param base 
 * @returns 
 */
export default function OneFlowify<TBase>(base:Constructor<TBase>):Constructor<TBase & IOneFlowified>{   
    return (hasModifierImplement(base, ModifierName) ? base : remakeClassInheritance(base, OneFlowComponent, Component)) as unknown as Constructor<TBase & IOneFlowified>
}

OneFlowify.REFERENCE = Enum({
    GLOBAL:0,
    SCEEN:1
})


// ------------ Decorator ---------------

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


/**
 * cascade
 * @param stateName 
 * @returns 
 */
export function action(type:string){
    const actionType:string = type;
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const constructor:Constructor = target.constructor;
        if(DEV){
            if(!hasModifierImplement(constructor as Constructor, ModifierName)){
                error('You need add the OneFlowified Modifier for this class to use @action');
            }
        }
        // 
        
        // descriptor.configurable = value;
        // const originMethod:Function = descriptor.value;
        // const constructor: any = target.constructor;
        // // 
        // if(!constructor[RENDER_MAP]){
        //     constructor[RENDER_MAP] = new Map<string, string[]>();
        // }
        // // 
        // const methods:string[] = (constructor[RENDER_MAP] as Map<string, string[]>).get(stateName.toString()) || [];
        // if(methods.indexOf(propertyKey) == -1){                
        //     (constructor[RENDER_MAP] as Map<string, string[]>).set(stateName.toString(), methods.concat(propertyKey));
        // }
        // // 
        // descriptor.value = function():Promise<any>{
        //     const returnValue:any = originMethod.apply(this, Array.from(arguments));
        //     return (typeof returnValue === 'object' && typeof returnValue.then === 'function') ? returnValue : Promise.resolve(returnValue);
        // }
    };
}