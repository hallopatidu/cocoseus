import { Component, warn } from "cc";
import { CCClass } from "cc";
import { js } from "cc";
import { Enum } from "cc";
import { Constructor } from "cc";
import { DEV } from "cc/env";

// export type ModifierType = <TArg>(constructor: Constructor<TArg>, arg?: any) => Constructor<TArg>

export function getHierarchyMethod(constructor:any, methodName:string):Function{
    if(!constructor) return null;
    return constructor?.prototype[methodName] || getHierarchyMethod(js.getSuper(constructor), methodName)
}

export function hasModifierImplement(constructor:Constructor, modifierName:string):boolean{
    if(!constructor) return false;    
    return constructor.name == modifierName ? true : hasModifierImplement(js.getSuper(constructor), modifierName);
}

export function enumifyProperty (targetObj:any, propName:string , newEnum:unknown):any {
    let defaultEnum = Object.assign( Enum({}) , newEnum);
    Enum['update'](defaultEnum);
    CCClass["Attr"].setClassAttr(targetObj, propName, 'type', 'Enum');
    CCClass["Attr"].setClassAttr(targetObj, propName, 'enumList', Enum["getList"](defaultEnum));
    return defaultEnum
}

export function convertToEnum(objOrArray:any):any{
    const enumDef: {[key: string]: number} = {};
    const names:string[] = Array.isArray(objOrArray) ? objOrArray : Object.keys(objOrArray);
    names.forEach((bundle:string, index:number)=>enumDef[bundle] = index)
    return Enum(enumDef)
}

export function mixinClass(base:Constructor, invokerCtor:Constructor):Constructor{
    const callbacksInvokerPrototype = invokerCtor.prototype;
    const propertyKeys: (string | symbol)[] =        (Object.getOwnPropertyNames(callbacksInvokerPrototype) as (string | symbol)[]).concat(
        Object.getOwnPropertySymbols(callbacksInvokerPrototype),
    );
    for (let iPropertyKey = 0; iPropertyKey < propertyKeys.length; ++iPropertyKey) {
        const propertyKey = propertyKeys[iPropertyKey];
        const basePrototype = base.prototype && Object.getPrototypeOf(base.prototype)
        if (!(propertyKey in basePrototype)) {
            const propertyDescriptor = Object.getOwnPropertyDescriptor(callbacksInvokerPrototype, propertyKey);
            if (propertyDescriptor) {
                Object.defineProperty(base.prototype, propertyKey, propertyDescriptor);
            }
        }
    }
    return base
}

/**
 * 
 * @param base 
 * @param newSegmentConstructor 
 * @returns 
 */

/**
 * Cutting a segment of class inheritance, add more a new segment to this point.
 * 
 * @param base 
 * @param newSegmentConstructor 
 * @param cuttingFromConstructor 
 * @returns 
 */
export function remakeClassInheritance<TBase, TSuper>(base:Constructor<TBase>, newSegmentConstructor:Constructor<TSuper>, cuttingFromConstructor:Constructor = Component):Constructor<TBase&TSuper|TBase|TSuper>{
    const superBase:Constructor = getSuperBase(base, cuttingFromConstructor);
    if(superBase){
        Object.setPrototypeOf(superBase, newSegmentConstructor);
        return base;
    }else{
        return newSegmentConstructor;
    }
}

/**
 * 
 * @param base 
 * @param modifierClass 
 * @returns 
 */
export function interleaveClassInheritance<TBase, TModifier>(base:Constructor<TBase>, modifierClass:Constructor<TModifier>):Constructor<TBase&TModifier>{
    
    return
}

/**
 * 
 * @param constructor 
 * @param lastSuper 
 * @returns 
 */
export function getSuperBase(constructor:Constructor, lastSuper:Constructor = Component){
    if(constructor == lastSuper) return null
    const superCtor = js.getSuper(constructor)
    return superCtor == lastSuper ? constructor : getSuperBase(superCtor)
}
// <TFunction extends Function>()

/**
 * 
 * @param constructor 
 * @param additionalConstructor 
 * @returns 
 */
export function Inheritancify<TBase, TSuper>(constructor:Constructor<TBase>, additionalConstructor:Constructor<TSuper>):Constructor<TBase&TSuper>{
    
    return
}