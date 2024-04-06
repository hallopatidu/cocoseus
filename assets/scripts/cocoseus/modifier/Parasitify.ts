import { _decorator, Component, Constructor, error, js, log, Node, warn } from 'cc';
import { Classify, hasModifierImplement } from './Classify';
import { DEV, EDITOR } from 'cc/env';
const { ccclass, property } = _decorator;

const OverrideMethodNameMap = Symbol();
const CheckEligibleForInheritance = Symbol();
const ExcuteHierarchyOverridding = Symbol();
const InitSuper = Symbol();
const GetParasiteSuperMethod = Symbol();
const SetParasiteSuperMethod = Symbol();
const GetOriginMethodName = Symbol();

/**
 * Can add override method for this method.
 * @param target 
 * @param propertyKey 
 * @param descriptor 
 */
export function override(target: Component, propertyKey: string, descriptor: PropertyDescriptor){        
    if(DEV){
        if(hasModifierImplement(target.constructor as Constructor,'Parasitified')){
            error('You should extending ParasiteComponent Class for this class to use @override');
        }
    }
    // 
    let listOfOverrideMethods:Set<string> = target[OverrideMethodNameMap];       
    if(!listOfOverrideMethods){
        listOfOverrideMethods = target[OverrideMethodNameMap] = new Set<string>();
    } 
    if(!listOfOverrideMethods.has(propertyKey)){
        listOfOverrideMethods.add(propertyKey);
    }
}


export interface IParasitified {
    get superName():string
}

export const Parasitify = Classify<IParasitified, Component>((base:Constructor<Component>,  superConstructor:Constructor = Component):Constructor<IParasitified&Component>=>{    
    class Parasitified extends (base as unknown as any) implements IParasitified {

        static Enum:any

        @property({
            displayName: 'Extends',        
            readonly:true
        })
        get superName():string{
            return this._$superName
        }
        
        protected _$id:number = 0;
        protected _$super:Component = null;    
        protected _$superName:string = '';
        protected super:typeof superConstructor = null;

        public get internalOnLoad (): (() => void) | undefined {
            // log(' Class name :: ' + superConstructor.name);
            const components:Component[] = (this as unknown as Component).getComponents(superConstructor as Constructor<Component>)
            components.forEach((com:Component, index:number)=>{
                log(com.uuid + ' :: ' + index);
            });
            // 
            this.node.getHierarchyMethod
            // this[ExcuteHierarchyOverridding]();
            // this[InitSuper]();
            return super.internalOnLoad
        }


    }
    return Parasitified as unknown as Constructor<Component&IParasitified>;
})


function getHierarchyComponentNames(comp:Component, defaultConstructor:Constructor<Component>, superConstructor:Constructor<Component>):string[]{
    const nameList:string[] = [];
    const components:Component[] = comp.getComponents(superConstructor)
    components.forEach((com:Component, index:number)=>{
        log(com.uuid + ' :: ' + index);
        nameList
    });
    return nameList
}

