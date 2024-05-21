import { _decorator, Component, Constructor, error, js, Node, warn } from 'cc';
import { DEV } from 'cc/env';

/**
 * Injector class. The class which is generated like a new class from the given base class, after polyfill all functionalities, inject to lifecycle of component.
 * 
 */

const InjectorTag:string = '$injector';

export const CACHE_KEY = '__ccclassCache__';
export const ENUM_PROPERTY_PREFIX:string = '__$enum__';
export const INDEX_PROPERTY_PREFIX:string = '__$enum_id__';
export const STRING_PROPERTY_PREFIX:string = '__$string__';
/**
 * Dangerous Function !!!
 * This function can changed all inheritances of cocos system.
 * Cutting a segment of class inheritance, add more a new segment to this point.
 * 
 * @param base 
 * @param newSegmentConstructor 
 * @param cuttingFromConstructor 
 * @returns 
 */
export function remakeClassInheritance<TBase, TSuper>(base:Constructor<TBase>, newSegmentConstructor:Constructor<TSuper>, cuttingFromConstructor:Constructor = Component):Constructor<TBase&TSuper|TBase|TSuper>{
    // let superCtor:Constructor = getSuperBase(base, cuttingFromConstructor);
    let superCtor:Constructor = base;
    while(superCtor && superCtor !== cuttingFromConstructor) superCtor = js.getSuper(base);    
    if(superCtor){
        Object.setPrototypeOf(superCtor, newSegmentConstructor);
        return base;
    }else{
        DEV && warn('remakeClassInheritance unsuccessful !!')
        return newSegmentConstructor;
    }
}

export function getHierarchyMethod(constructor:any, methodName:string):Function{
    if(!constructor) return null;
    return constructor?.prototype[methodName] || getHierarchyMethod(js.getSuper(constructor), methodName)
}

/**
 * 
 * @param constructor 
 * @param lastSuper 
 * @returns 
 */
// export function getSuperBase(constructor:Constructor, lastSuper:Constructor = Component){
//     if(constructor == lastSuper) return null
//     const superCtor = js.getSuper(constructor)
//     return superCtor == lastSuper ? constructor : getSuperBase(superCtor)
// }

/**
 * 
 * @param base 
 * @param invokerCtor 
 * @returns 
 */
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

// 
export function hadInjectorImplemented(baseCtor:Constructor, injectorName:string):boolean{
    if(!baseCtor) return false;    
    return (baseCtor.name.indexOf(injectorName) !== -1) || (baseCtor[InjectorTag] && baseCtor[InjectorTag].indexOf(injectorName) !== -1) ? true : hadInjectorImplemented(js.getSuper(baseCtor), injectorName);    
}

export function getInjector(injectorName:string, baseCtor:Constructor, currentBaseCtorName:string = baseCtor.name):Constructor{
    if(!baseCtor) {
        error("Can not find the injector with the name " + injectorName + ". The class " + currentBaseCtorName + " need to be Inheritancified with " + injectorName + " injector.");
        return null;    
    }
    return (baseCtor.name.indexOf(injectorName) !== -1) || (baseCtor[InjectorTag] && baseCtor[InjectorTag].indexOf(injectorName) !== -1) ? baseCtor : getInjector(injectorName, js.getSuper(baseCtor), currentBaseCtorName);    
}

export function lastInjector<TStaticInjector>(base:any):TStaticInjector|null{
    if(!base) return null;
    return (base[InjectorTag] ? getInjector(base[InjectorTag], base) : lastInjector(base)) as TStaticInjector|null;
}


type validateTBase<T> = T extends Constructor<Component> ? Constructor<T> : any;
type ReturnInheritancified<T, TCtor> = T extends { __props__: unknown, __values__: unknown }? Constructor<T> : TCtor;
/**
 * Base on the new intergaraion method class which found on Coco Engine Source.
 * Main Idea is generatting a new class from the given base class, after polyfill all functionalities
 * @param constructor 
 * @param additionalConstructor 
 * @returns 
 */
export function Inheritancify<TInjector, TStaticInjector>(injectorMethod:<TBase>(...args:Constructor<TBase>[])=>Constructor<TBase & TInjector>):(<TBase>(base:validateTBase<TBase>)=>ReturnInheritancified<TBase&TInjector, TStaticInjector>){    
    
    return function<TBase>(base:validateTBase<TBase>):ReturnInheritancified<TBase&TInjector, TStaticInjector>{
        if(!!base['__props__'] && !!base['__values__']){            // 
            if(hadInjectorImplemented(base as Constructor, injectorMethod.name)) return base as unknown as ReturnInheritancified<TBase&TInjector, TStaticInjector>;
            const superClass:TStaticInjector = injectorMethod.apply(this, Array.from(arguments));
            if(hadInjectorImplemented(base as Constructor, (superClass as Constructor).name)) return base as unknown as ReturnInheritancified<TBase&TInjector, TStaticInjector>;     
            superClass[InjectorTag] = injectorMethod.name;
            return superClass as unknown as ReturnInheritancified<TBase&TInjector, TStaticInjector>;
        }else{
            const ctor:Constructor = base.constructor as Constructor;
            return getInjector(injectorMethod.name, ctor)  as unknown as ReturnInheritancified<TBase&TInjector, TStaticInjector>;
        }   
    } as <TBase>(base:validateTBase<TBase>)=>ReturnInheritancified<TBase&TInjector, TStaticInjector>
}
