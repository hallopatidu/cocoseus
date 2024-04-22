import { Component, _decorator, warn } from "cc";
import { CCClass } from "cc";
import { js } from "cc";
import { Enum } from "cc";
import { Constructor } from "cc";
import { Support } from "../utils/Support";
import { IModifierState } from "../types/ModifierType";
const { ccclass } = _decorator;

const State = Symbol()

export function getHierarchyMethod(constructor:any, methodName:string):Function{
    if(!constructor) return null;
    return constructor?.prototype[methodName] || getHierarchyMethod(js.getSuper(constructor), methodName)
}



export function hasImplement(constructor:Constructor, modifierName:string):boolean{
    if(!constructor) return false;    
    return constructor.name.indexOf(modifierName) !== -1 ? true : hasImplement(js.getSuper(constructor), modifierName);
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

// const StorageHub:Map<number, Map<number, any>> = new Map<number, Map<number, any>> ()
// ------------------------------------------------

/**
 * 
 * @param modifierKey 
 * @returns 
 */
// export function getModifierStorage<TStorage>(modifierKey:string|number):Map<number, TStorage>{    
//     const modifierToken:number = js.isNumber(modifierKey) ? modifierKey as number : Support.tokenize(modifierKey as string);
//     if(!StorageHub.has(modifierToken)){
//         StorageHub.set(modifierToken, new Map<number, TStorage>);
//     }
//     return StorageHub.get(modifierToken);
// }

/**
 * 
 * @param modifier 
 * @param classToken 
 * @param data 
 */
// export function recordClassToken<TData>(modifier:Function, classToken:string|number, data:TData){
//     const customToken:number = js.isNumber(classToken) ? classToken as number : Support.tokenize(classToken as string);
//     const storage:Map<number, TData> = getModifierStorage<TData>(modifier.name);
//     storage.set(customToken, data)
// }

/**
 * 
 * @param modifier 
 * @returns 
 */
// export function storage<TData>(modifier:Function):ModifierMethod<TData>{
//     const storage:Map<number, TData> = getModifierStorage<TData>(modifier.name);
//     return {
//         record:(token:number, data:TData)=>{
//             storage.set(token, data)
//         },
//         select:(token:number):TData=>{
//             return storage.get(token)
//         }
//     }
// }


// export class ModifierStorage<TData> {
//     static Storage:Map<number, Map<number, any>> = new Map<number, Map<number, any>> ();

//     private modifierToken:number

//     constructor(modifier:Function){
//         this.modifierToken = Support.tokenize(modifier.name);
//     }

//     /**
//      * 
//      * @param modifier 
//      * @returns 
//      */
//     private get<TData>(modifier:Function):Map<number, TData>{
//         const modifierToken:number = Support.tokenize(modifier.name);
//         if(!ModifierStorage.Storage.has(modifierToken)){
//             ModifierStorage.Storage.set(modifierToken, new Map<number, TData>);
//         }
//         return ModifierStorage.Storage.get(modifierToken);
//     }

//     /**
//      * 
//      * @param token 
//      * @param data 
//      */
//     record<TData>(token:string|number, data:TData){
//         const customToken:number = js.isNumber(token) ? token as number : Support.tokenize(token as string);
//         ModifierStorage.Storage.get(this.modifierToken).set(customToken, data);
//     }

//     /**
//      * 
//      * @param token 
//      * @returns 
//      */
//     select<TData>(token:string|number):TData{
//         const customToken:number = js.isNumber(token) ? token as number : Support.tokenize(token as string);
//         return ModifierStorage.Storage.get(this.modifierToken).get(customToken);
//     }
// }

/**
 * 
 * @param modifier 
 * @returns 
 */
// export function useState<TState>(target:any, modifier:Function|string):Constructor<TState>{
//     // const token:number = js.isString(modifier) ? Support.tokenize(modifier as string) : (modifier as Function).name;
//     return 
// }

// --------------- Modifier -----------------

const StateStorage:Map<number, Set<string>> = new Map<number, Set<string>>();

export function hasModifierImplement(constructor:Constructor, state:Constructor):boolean{
    if(!constructor) return false;
    return constructor[State] && constructor[State].constructor == state ? true : hasModifierImplement(js.getSuper(constructor), state);
}

/**
 * 
 * @param constructor 
 * @param additionalConstructor 
 * @returns 
 */
export function Modifierify<TModifier>(modifier:Function, stateConstructor:Constructor<DefaultModifierState>):(<TBase>(base: Constructor<TBase>) => Constructor<TBase & TModifier>){    
    return function<TBase>(base:Constructor<TBase>):Constructor<TBase&TModifier>{
        // 
        if(hasModifierImplement(base, stateConstructor)) return base as unknown as Constructor<TBase&TModifier>;
        //
        
        // if(!StateStorage.has(stateToken)){
        //     StateStorage.set(stateToken, stateConstructor);
        // }
        // Neu modifierTemplateClassName chua duoc khoi tao. Map tuong ung ten cua Modifier voi state data.
        // if(!modifierListingStorage.has(ModifierifyToken)) { 
        //     modifierListingStorage.set(ModifierifyToken, state);
        // };
        const superClass:Constructor = modifier.apply(this, Array.from(arguments));        
        superClass[State] = new stateConstructor();
        return superClass as unknown as Constructor<TBase&TModifier>;
    } as <TBase>(base:Constructor<TBase>)=>Constructor<TBase&TModifier>;

}

@ccclass('DefaultIdentifier')
export class DefaultModifierState {    
    
    /**
     * Goi ra data dung chung giua cac class va cac instance dung chung modifier state
     * @param target 
     * @returns 
     */
    static use<TState>(target:any):TState{
        const constructor = target.constructor;
        if(!constructor) return null;
        if(constructor[State] && constructor[State].constructor == this){            
            const state:DefaultModifierState = constructor[State];
            state.registerClass(this.name, constructor.name)
            return state as TState;
        }else{
            return this.use<TState>(js.getSuper(constructor))
        }        
    }

    protected _token:number = -1

    constructor(token:number|string){
        this._token = js.isNumber(token) ? token as number : Support.tokenize(token as string);
    }

    registerClass(stateToken:string|number, className:string){
        const verifyStateToken:number = js.isNumber(stateToken) ? stateToken as number : Support.tokenize(stateToken as string);
        if(stateToken && !StateStorage.has(verifyStateToken)){
            StateStorage.set(verifyStateToken, new Set<string>());
        }
        (StateStorage.get(verifyStateToken) as Set<string>).add(className);
    }

    hasRegister(stateToken:number, className:string):boolean{
        const verifyStateToken:number = js.isNumber(stateToken) ? stateToken as number : Support.tokenize(stateToken as string);
        if(stateToken && !StateStorage.has(verifyStateToken)){
            StateStorage.set(verifyStateToken, new Set<string>());
        }
        return (StateStorage.get(verifyStateToken) as Set<string>).has(className);
    }

    getState(){
        
    }

}

