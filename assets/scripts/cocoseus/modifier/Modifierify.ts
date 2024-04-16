import { Component, warn } from "cc";
import { CCClass } from "cc";
import { js } from "cc";
import { Enum } from "cc";
import { Constructor } from "cc";
import { ModifierName } from "./AsyncProcessify";
import { Support } from "../utils/Support";

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


export function getTokenSet(that:any, tag:any):Set<number>{
    return that[tag] || ((that[tag])=new Set<number>());
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

const StorageHub:Map<number, Map<number, any>> = new Map<number, Map<number, any>> ()
// ------------------------------------------------

/**
 * 
 * @param modifierKey 
 * @returns 
 */
export function getModifierStorage<TStorage>(modifierKey:string|number):Map<number, TStorage>{
    const modifierToken:number = js.isNumber(modifierKey) ? modifierKey as number : Support.tokenize(modifierKey as string);
    if(!StorageHub.has(modifierToken)){
        StorageHub.set(modifierToken, new Map<number, TStorage>)
    }
    return StorageHub.get(modifierToken);
}

function updateModifierMethod(constructor:Constructor, methodName:string, value:Function){
    if(!getHierarchyMethod(constructor, methodName)){
        constructor.prototype[methodName] = value;
    }
}

/**
 * 
 * @param constructor 
 * @param additionalConstructor 
 * @returns 
 */
export function Modifierify<TModifier, TData>(modifier:Function){
    // Lay storge chua dang ky cua cac modifier. modifierifyStorage chua ten map voi class cua cac Modifier.
    const ModifierifyToken:number = Support.tokenize(modifier.name)
    const modifierNamedStorage:Map<number, string> = getModifierStorage<string>(Modifierify.name);
    // 
    
    let modifierTemplateClassName:string = modifierNamedStorage.get(ModifierifyToken);
    // 
    return function<TBase>(base:Constructor<TBase>):Constructor<TBase&TModifier>{
        // Kiem tra lan 1, trong truong hop da ton tai Modifier.
        if(modifierTemplateClassName && hasModifierImplement(arguments[0], modifierTemplateClassName)) return base as unknown as Constructor<TBase&TModifier>;        
        //
        const superClass:Constructor = modifier.apply(this, Array.from(arguments));        
        // Neu modifierTemplateClassName chua duoc khoi tao. Map tuong ung ten cua Modifier voi ten cua Modifier Template Class.
        if(!modifierTemplateClassName) { 
            modifierTemplateClassName = superClass.name;
            modifierNamedStorage.set(ModifierifyToken, modifierTemplateClassName)
        };        
        // Kiem tra lan 2 trong truong hop modifierTemplateClassName chua duoc khai bao lan nao.
        if(!modifierTemplateClassName && hasModifierImplement(base, modifierTemplateClassName)) return base as unknown as Constructor<TBase&TModifier>;        

        // Note: Chua xu ly van de nhieu modifier ghi de funtion doan nay
        // Khai bao cac func dac thu cua mot Modifier. 
        updateModifierMethod(superClass, 'getClassTokens', function(modifierToken:number):number[]{
            const tokenSet:Set<number> = getTokenSet(this.constructor, modifierToken);
            return [...tokenSet.values()]
        })

        updateModifierMethod(superClass, 'getInstanceTokens', function(modifierToken:number):number[]{
            const tokenSet:Set<number> = getTokenSet(this, modifierToken);
            return [...tokenSet.values()]
        })

        updateModifierMethod(superClass, 'recordTokenData', function(modifierToken:number, customToken:number, data:TData):boolean{
            const customStorage = getModifierStorage<typeof data>(modifierToken)
            const tokenSet:Set<number> = getTokenSet(this, modifierToken);                
            return !customStorage.has(customToken) && !!customStorage.set(customToken, data) && !!tokenSet.add(customToken);
        })
        // 
        return superClass as unknown as Constructor<TBase&TModifier>;
    } as <TBase>(base:Constructor<TBase>)=>Constructor<TBase&TModifier>
}