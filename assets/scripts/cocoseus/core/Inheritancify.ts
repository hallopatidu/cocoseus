import { __private, _decorator, Component, Constructor, error, js, log, Node, warn } from 'cc';
import { CACHE_KEY, CCEditor } from '../utils/CCEditor';
import { ClassStash, DecorateHandlerType, DecoratePropertyType, IPropertyOptions, LegacyPropertyDecorator, PropertyStash, PropertyType } from '../types/CoreType';
const {property} = _decorator

export const InjectorTag = Symbol() //'$injector';

type validateTBase<T> = T extends Constructor<Component> ? Constructor<T> : any;
type ReturnInheritancified<T, TCtor> = T extends { __props__: unknown, __values__: unknown }? Constructor<T> : TCtor;

/**
 * Injector class. The class which is generated like a new class from the given base class, after polyfill all functionalities, inject to lifecycle of component.
 * 
 */


/**
 * Dangerous Function !!!
 * This function can changed all inheritances of cocos system.
 * Cutting a segment of class inheritance, add more a new segment to this point.
 * Untest function
 * @param base 
 * @param newSegmentConstructor 
 * @param cuttingFromConstructor 
 * @returns 
 */
// export function remakeClassInheritance<TBase, TSuper>(base:Constructor<TBase>, newSegmentConstructor:Constructor<TSuper>, cuttingFromConstructor:Constructor = Component):Constructor<TBase&TSuper|TBase|TSuper>{
//     // let superCtor:Constructor = getSuperBase(base, cuttingFromConstructor);
//     let superCtor:Constructor = base;
//     while(superCtor && superCtor !== cuttingFromConstructor) superCtor = js.getSuper(base);    
//     if(superCtor){
//         Object.setPrototypeOf(superCtor, newSegmentConstructor);
//         return base;
//     }else{
//         DEV && warn('remakeClassInheritance unsuccessful !!')
//         return newSegmentConstructor;
//     }
// }

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
    if(!injectorName || !injectorName.length) return false;    
    if(!baseCtor) return false;    
    // return (baseCtor.name.indexOf(injectorName) !== -1) || 
    return (baseCtor[InjectorTag] && baseCtor[InjectorTag].indexOf(injectorName) !== -1) ? true : hadInjectorImplemented(js.getSuper(baseCtor), injectorName);    
}

export function getInjector(injectorName:string, baseCtor:Constructor, currentBaseCtorName:string = baseCtor.name):Constructor{
    if(!baseCtor) {
        error("Can not find the injector with the name " + injectorName + ". The class " + currentBaseCtorName + " need to be Inheritancified with " + injectorName + " injector.");
        return null;    
    }
    // else{
    //     warn('injector : ' + injectorName + ' -class : ' + baseCtor.name + ' -getted ' + baseCtor[InjectorTag]);
    // }
    return (baseCtor[InjectorTag] && baseCtor[InjectorTag].indexOf(injectorName) !== -1) ? baseCtor : getInjector(injectorName, js.getSuper(baseCtor), currentBaseCtorName);
}

export function lastInjector<TStaticInjector>(base:any):TStaticInjector|null{
    if(!base) return null;
    return (base[InjectorTag] ? getInjector(base[InjectorTag], base) : lastInjector(base)) as TStaticInjector|null;
}


/**
 * 
 * Base on the new intergaraion method class which found on Coco Engine Source.
 * Main Idea is generatting a new class from the given base class, after polyfill all functionalities.
 * @param constructor 
 * @param additionalConstructor 
 * @returns 
 */
export function Inheritancify<TInjector, TStaticInjector>(injectorMethod:<TBase>(...args:Constructor<TBase>[])=>Constructor<TBase & TInjector>, injectorName:string = injectorMethod.name ):(<TBase>(base:validateTBase<TBase>)=>ReturnInheritancified<TBase&TInjector, TStaticInjector>){
    return function<TBase>(base:validateTBase<TBase>, targetInjectorName:string = injectorName):ReturnInheritancified<TBase&TInjector, TStaticInjector>{
        if(!!base['__props__'] && !!base['__values__']){            
            // 
            if(hadInjectorImplemented(base as Constructor, injectorName)) return base as unknown as ReturnInheritancified<TBase&TInjector, TStaticInjector>;
            const superClass:TStaticInjector = implementInjectorMethod(injectorMethod, injectorName, arguments);
            return superClass as unknown as ReturnInheritancified<TBase&TInjector, TStaticInjector>;
        }else{
            const ctor:Constructor = base.constructor as Constructor || base//|| Object.getPrototypeOf(base);
            // const injector:ReturnInheritancified<TBase&TInjector, TStaticInjector> = (getInjector(targetInjectorName, ctor) || injectorMethod(ctor))  as unknown as ReturnInheritancified<TBase&TInjector, TStaticInjector> ;
            const injector:ReturnInheritancified<TBase&TInjector, TStaticInjector> = getInjector(targetInjectorName, ctor)   as unknown as ReturnInheritancified<TBase&TInjector, TStaticInjector> ;
            return injector;
        }
    } as <TBase>(base:validateTBase<TBase>)=>ReturnInheritancified<TBase&TInjector, TStaticInjector>
}


// ----------------------------------- Class Plugin -----------------------------------

/**
 * 
 * @param injectorMethod 
 * @param injectorName 
 * @returns 
 */
export function CCClassify<TInjector, TStaticInjector>(injectorMethod:<TBase>(...args:Constructor<TBase>[])=>Constructor<TBase & TInjector>, injectorName:string = injectorMethod.name ):(<TBase>(base:validateTBase<TBase>)=>ReturnInheritancified<TBase&TInjector, TStaticInjector>){
    return function<TBase>(base:validateTBase<TBase>):ReturnInheritancified<TBase&TInjector, TStaticInjector>{
        if(hadInjectorImplemented(base as Constructor, injectorName)) return base as unknown as ReturnInheritancified<TBase&TInjector, TStaticInjector>;
        //         
        let superClass:TStaticInjector = implementInjectorMethod(injectorMethod, injectorName, arguments);
        if(!superClass) error('Please, declare the injector class and return it inside injector function !')
        // 
        superClass = CCEditor.extendClassCache(superClass);
        extendCustomizedProperties(superClass as Constructor);
        //  
        return superClass as unknown as ReturnInheritancified<TBase&TInjector, TStaticInjector>;
    } as <TBase>(base:validateTBase<TBase>)=>ReturnInheritancified<TBase&TInjector, TStaticInjector>
}

        /**
         * 
         * @param injectorMethod 
         * @param injectorName 
         * @param args 
         * @returns 
         */
        function implementInjectorMethod<TInjector, TStaticInjector>(injectorMethod:<TBase>(...args:Constructor<TBase>[])=>Constructor<TBase & TInjector>, injectorName:string, args:any):TStaticInjector{    
            const superClass:TStaticInjector = injectorMethod.apply(this, Array.from(args));            
            const injector:string[]= superClass[InjectorTag] || (superClass[InjectorTag] ??= []);           
                if(injector.indexOf(injectorName) == -1){   
                    injector.push(injectorName);
            }
            return superClass;
        }

        /**
         * 
         * @param constructor 
         */
        function extendCustomizedProperties(constructor:Constructor){
            const classStash:ClassStash = constructor[CACHE_KEY] || ((constructor[CACHE_KEY]) = {});
            const ccclassProto = CCEditor.getSubDict<ClassStash, keyof ClassStash>(classStash, 'proto');
            const properties:Record<string, PropertyStash> = CCEditor.getSubDict(ccclassProto, 'properties');
            const propertyKeys:string[] = Object.keys(properties);
            propertyKeys.forEach((key:string)=>{
                const propertyStash:PropertyStash = properties[key];
                if(propertyStash && propertyStash.__$extends && propertyStash.__$extends.length){                    
                    while(propertyStash.__$extends.length){
                        const executeDecoratorFunction:Function = propertyStash.__$extends.shift();
                        executeDecoratorFunction && executeDecoratorFunction();
                    }
                    delete propertyStash.__$extends;
                }

            });             
        }
        
/**
 * 
 * @param decoratorHandler 
 * @returns 
 */
export function generateCustomPropertyDecorator(type:string, decoratorHandler:DecorateHandlerType):DecoratePropertyType{ 
    return CCEditor.generateDecorator(type, function( 
        cache?:ClassStash, 
        propertyStash?:PropertyStash, 
        ctor?: new ()=>unknown, 
        propertyKey?:string|symbol,
    ){
        // 
        propertyStash.__$extends = propertyStash.__$extends  || [];        
        propertyStash.__$extends.push(decoratorHandler.bind(this, cache, propertyStash, ctor, propertyKey));
        // 
    }) as DecoratePropertyType
}

/**
 * 
 * @param decoratorName 
 * @param decoratorHandler 
 * @returns 
 */
export function remakeClassProperty(constructor:Constructor, decoratorName:string, decoratorHandler:DecorateHandlerType){    
    const classStash:ClassStash = constructor[CACHE_KEY] || ((constructor[CACHE_KEY]) = {});
    const ccclassProto = CCEditor.getSubDict<ClassStash, keyof ClassStash>(classStash, 'proto');
    const properties:Record<string, PropertyStash> = CCEditor.getSubDict(ccclassProto, 'properties');     
    const propertyKeys:string[] = Object.keys(properties);
    propertyKeys.forEach((key:string|symbol)=>{     
        const propertyStash:PropertyStash = properties[key.toString()];   
        if(!propertyStash.__$decorate) {propertyStash.__$decorate = 'property';}   
        if( propertyStash.__$decorate == decoratorName.toString() && propertyStash && propertyStash.__$extends && propertyStash.__$extends.length  ){
            // 
            propertyStash.__$extends = propertyStash.__$extends  || [];
            propertyStash.__$extends.push(decoratorHandler.bind(this, classStash, propertyStash, constructor, key));
            // 
        }

    });       
    return
}