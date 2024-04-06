import { Component, warn } from "cc";
import { CCClass } from "cc";
import { js } from "cc";
import { Enum } from "cc";
import { Constructor } from "cc";
import { DEV } from "cc/env";

export type ModifierType = <TArg>(constructor: Constructor<TArg>, arg?: any) => Constructor<TArg>

const ModifierName = Symbol();

export function getHierarchyMethod(constructor:any, methodName:string):Function{
    if(!constructor) return null;
    return constructor?.prototype[methodName] || getHierarchyMethod(js.getSuper(constructor), methodName)
}

export function hasModifierImplement(constructor:Constructor, modifierName:string):boolean{
    if(!constructor) return false;    
    return ((constructor[ModifierName] ??= []) as string[]).findIndex((modName:string)=> modName == modifierName) == -1 ? hasModifierImplement(js.getSuper(constructor), modifierName) : true;
}

export function implementModifier(constructor:Constructor):Constructor{
    if(!constructor) return null;
    const modifierName:string = constructor.name;
    if(!hasModifierImplement(constructor, modifierName)){
        (constructor[ModifierName] ??= []).push(modifierName)
    }
}


// export function Classify(constructor:Constructor, modifier:ModifierType, ...mixins:Constructor[]):ModifierType{
//     if(!constructor) return null;
//     // this.hasModifierImplement(constructor)
    
// }

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


export function Classify<TModifier, TBase=Component>(
    modifier: (constructor: Constructor<TBase>, arg?: any) => Constructor<TBase&TModifier>
): typeof modifier {
    return function(base:Constructor<TBase>, arg?:any):Constructor<TBase&TModifier>{
        const modifierName:string = base.name;
        if(!hasModifierImplement(base, modifierName)){
            (base[ModifierName] ??= []).push(modifierName);
            return modifier(base, arg)
        }
        return base as unknown as Constructor<TBase&TModifier>;
    } as typeof modifier;
}