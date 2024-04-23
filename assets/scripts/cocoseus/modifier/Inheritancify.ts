import { _decorator, Component, Constructor, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('InheritanceInvoker')
export class InheritanceInvoker {
    
}



/**
 * 
 * @param constructor 
 * @param additionalConstructor 
 * @returns 
 */
type validateTBase<T> = T extends { __props__: unknown, __values__: unknown } ? Constructor<T> : any;
type ReturnModifier<T> = T extends Component? Constructor<T> : InheritanceInvoker;

export function Inheritancify<TModifier>(executeMethod:(...arg:any)=>Constructor<Component>, invokerCtor:Constructor<InheritanceInvoker>):(<TBase>(base:validateTBase<TBase>)=>ReturnModifier<TBase&TModifier>){    
    
    return function<TBase>(base:validateTBase<TBase>):ReturnModifier<TBase&TModifier>{
        if(base['__props__'] && base['__values__']){            // 
            if(isValid(base as Constructor, invokerCtor)) return base as unknown as ReturnModifier<TBase&TModifier>;
            const superClass:Constructor = executeMethod.apply(this, Array.from(arguments));        
            // superClass[State] = new stateConstructor(modifier.name);
            return superClass as unknown as ReturnModifier<TBase&TModifier>;
        }else{
            // return useState.call(stateConstructor, base)
        }   
    } as <TBase>(base:validateTBase<TBase>)=>ReturnModifier<TBase&TModifier>
}


function isValid(baseCtor:Constructor, invokerCtor:Constructor<InheritanceInvoker>):boolean{
    return
}
