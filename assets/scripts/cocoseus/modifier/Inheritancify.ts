import { _decorator, Component, Constructor, error, js, Node } from 'cc';
const { ccclass, property } = _decorator;

// @ccclass('InheritanceInvoker')
// export class InheritanceInvoker {
    
// }

/**
 * Injector class. The class which is generated like a new class from the given base class, after polyfill all functionalities, inject to lifecycle of component.
 * 
 */

const InjectorTag:string = '$injector';

// 
function isValid(baseCtor:Constructor, injectorName:string):boolean{
    if(!baseCtor) return false;    
    return (baseCtor.name.indexOf(injectorName) !== -1) || (baseCtor[InjectorTag] && baseCtor[InjectorTag].indexOf(injectorName) !== -1) ? true : isValid(js.getSuper(baseCtor), injectorName);    
}

function getInjector(injectorName:string, baseCtor:Constructor):Constructor{
    if(!baseCtor) {
        error("Can not find the injector with the name " + injectorName + ". The class " + baseCtor.name + " need to be Inheritancified with " + injectorName + " injector.");
        return null;    
    }
    return (baseCtor.name.indexOf(injectorName) !== -1) || (baseCtor[InjectorTag] && baseCtor[InjectorTag].indexOf(injectorName) !== -1) ? baseCtor : getInjector(injectorName, js.getSuper(baseCtor));    
}

/**
 * 
 * @param constructor 
 * @param additionalConstructor 
 * @returns 
 */
type validateTBase<T> = T extends { __props__: unknown, __values__: unknown } ? Constructor<T> : any;
type ReturnInheritancified<T, TCtor> = T extends { __props__: unknown, __values__: unknown }? Constructor<T> : TCtor;

export function Inheritancify<TInjector, TStaticInjector>(executeMethod:Function):(<TBase>(base:validateTBase<TBase>)=>ReturnInheritancified<TBase&TInjector, TStaticInjector>){    
    
    return function<TBase>(base:validateTBase<TBase>):ReturnInheritancified<TBase&TInjector, TStaticInjector>{
        if(base['__props__'] && base['__values__']){            // 
            if(isValid(base as Constructor, executeMethod.name)) return base as unknown as ReturnInheritancified<TBase&TInjector, TStaticInjector>;
            const superClass:TStaticInjector = executeMethod.apply(this, Array.from(arguments));
            if(isValid(base as Constructor, (superClass as Constructor).name)) return base as unknown as ReturnInheritancified<TBase&TInjector, TStaticInjector>;     
            superClass[InjectorTag] = executeMethod.name;
            return superClass as unknown as ReturnInheritancified<TBase&TInjector, TStaticInjector>;
        }else{
            const ctor:Constructor = base.constructor as Constructor;
            return getInjector(executeMethod.name, ctor)  as unknown as ReturnInheritancified<TBase&TInjector, TStaticInjector>;
        }   
    } as <TBase>(base:validateTBase<TBase>)=>ReturnInheritancified<TBase&TInjector, TStaticInjector>
}



