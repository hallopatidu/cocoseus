import { Component, warn } from "cc";
import { CCClass } from "cc";
import { js } from "cc";
import { Enum } from "cc";
import { Constructor } from "cc";
import { DEV } from "cc/env";

export type ModifierType = <TArg>(constructor: Constructor<TArg>, arg?: any) => Constructor<TArg>

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
        if (!(propertyKey in base.prototype)) {
            const propertyDescriptor = Object.getOwnPropertyDescriptor(callbacksInvokerPrototype, propertyKey);
            if (propertyDescriptor) {
                Object.defineProperty(base.prototype, propertyKey, propertyDescriptor);
            }
        }
    }
    return base
}

export function Classify(base:Constructor, modifierClass:Constructor){
    
}