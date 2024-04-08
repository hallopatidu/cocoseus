import { _decorator, Component, Constructor, Enum, error, js, log, Node, warn } from 'cc';
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

let DefaultParasiteEnum = Enum({NON:-1})

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

/**
 * 
 */
type ParasiteModifier = (base:Constructor<Component>,  superConstructors:Constructor)=>Constructor<IParasitified&Component> 
export interface IParasitified {
    // get superName():string
}

/**
 * 
 */
export const Parasitify:ParasiteModifier = Classify<IParasitified, Component>((base:Constructor<Component>,  superConstructor:Constructor = Component):Constructor<IParasitified&Component>=>{    
    class Parasitified extends (base as unknown as any) implements IParasitified {
        static ENUM:any = DefaultParasiteEnum;
        @property({
            type:DefaultParasiteEnum,
            displayName: 'Extends'
        })
        superIndex:number = -1;
        // get superName():string{
        //     return this._$superName
        // }
        
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
            
            // 
            // this[ExcuteHierarchyOverridding]();
            // this[InitSuper]();
            return super.internalOnLoad
        }

        /**
         * 
         * @param component 
         * @returns 
         */
        [CheckEligibleForInheritance](component:Component):boolean{
            // return Boolean(!!component && component.enabled)
            return EDITOR ?  Boolean(!!component && component.enabled) : !!component 
        }

        /**
         * 
         */
        [ExcuteHierarchyOverridding](){ 
            if(!this.node) return;
            const allNodeComponents:ReadonlyArray<Component> = this.node.components;
            const numberOfComponent:number = allNodeComponents.length;
            let hostComp:Component = null;
            let firstParasite:Component = null;        
            const previousCompIndex:number = allNodeComponents.findIndex((component:Component, index:number, allComponents:Component[])=>{
                const eligibleForInheritance:boolean = this[CheckEligibleForInheritance](component)          
                let investigateComp:Component = null;
                if(eligibleForInheritance){
                    // const componentIsParasite:boolean = js.isChildClassOf(component.constructor, ParasiteComponent);                     
                    const componentIsParasite:boolean = hasModifierImplement(component.constructor as Constructor, 'Parasitified')
                    hostComp = componentIsParasite ? hostComp : component;                
                    let enabledIndex:number = index;
                    // Search enabled nextComp
                    while(enabledIndex < numberOfComponent - 1){
                        investigateComp = allComponents[++enabledIndex];
                        if(this[CheckEligibleForInheritance](investigateComp)){                    
                            break;
                        }else{
                            continue;
                        }
                    }
                    firstParasite = investigateComp && !componentIsParasite ? investigateComp : firstParasite;
                }
                // Old code.
                // if(index < numberOfComponent - 1){
                //     nextComp = allComponents[index+1];                
                //     nextComp = nextComp.enabled ? nextComp : null;
                //     // update firstParasite
                //     firstParasite = nextComp && !componentIsParasite ? nextComp : firstParasite;
                // }
                // 
                return eligibleForInheritance && investigateComp && (investigateComp == this);
            })
            // 
            this._$id = previousCompIndex + 1;
            const previousComponent:Component = allNodeComponents[previousCompIndex];
            if(previousComponent){
                this._$super = previousComponent;
                this._$superName = js.getClassName(previousComponent);
                // Find a final Parasite Component. Do not need at this time.
                // let isFinalParasite:boolean = false;
                // const nextComponent:Component = previousCompIndex < numberOfComponent - 2 ? allNodeComponents[previousCompIndex + 2] : null;
                // if(!nextComponent || (nextComponent && !js.isChildClassOf(nextComponent.constructor, ParasiteComponent))){
                //     // the last Parasite Component.       
                //     isFinalParasite = true;
                // }
            }
            // 
            if(this._$super){
                const listOfOverrideMethods:Set<string> = this[OverrideMethodNameMap];
                listOfOverrideMethods && listOfOverrideMethods.forEach((methodName:string)=>{
                    const hostDesc:PropertyDescriptor = js.getPropertyDescriptor(hostComp, methodName);
                    if(hostDesc){
                        const originMethodName:string = this[GetOriginMethodName](methodName);
                        const thisDesc:PropertyDescriptor = js.getPropertyDescriptor(this, methodName);
                        if(firstParasite && !Object.prototype.hasOwnProperty.call(firstParasite, originMethodName)){    
                            // the frist parasite saved all origin method.                
                            Object.defineProperty(firstParasite, originMethodName, hostDesc);
                        }
                        // 
                        if(thisDesc && firstParasite){                        
                            if(hostDesc.get || hostDesc.set){                          
                                delete hostComp[methodName];
                                js.getset(hostComp, 
                                    methodName, 
                                    thisDesc.get ? thisDesc.get.bind(this) : hostDesc.get.bind(hostComp), 
                                    thisDesc.set ? thisDesc.set.bind(this) : hostDesc.set.bind(hostComp),
                                    thisDesc.enumerable, 
                                    thisDesc.configurable);

                            }else if(hostDesc.value !== undefined && typeof hostDesc.value == 'function'){
                                js.value(hostComp,
                                    methodName,
                                    thisDesc.value ? thisDesc.value.bind(this) : hostDesc.value.bind(hostComp), 
                                    thisDesc.writable || hostDesc.writable,
                                    thisDesc.enumerable || hostDesc.enumerable);
                                
                            }else{                            
                                // If method is a normal attribute of host's class but you want to convert it to be a get/set method.                            
                                if(thisDesc.get || thisDesc.set){                                
                                    js.getset(hostComp, 
                                        methodName, 
                                        thisDesc.get ? thisDesc.get.bind(this) : ()=>{
                                            return firstParasite[originMethodName]
                                        } ,         
                                        thisDesc.set ? thisDesc.set.bind(this): (value:any)=>{
                                            firstParasite[originMethodName] = value
                                        }, 
                                        thisDesc.enumerable,
                                        thisDesc.configurable)
                                }
                            }                        

                        }else{
                            delete this[originMethodName];
                        }
                    }else{
                        warn('The method ' + methodName + ' do not exist in the Host: ' + js.getClassName(hostComp));
                    }
                    // 
                })
                // 
            }      
            //   
        }

        /**
         * 
         */
        [InitSuper](){
            if(this._$super){
                const superProxy:ProxyConstructor = new Proxy(this, {  
                    get: (target:any, prop:string) => this[GetParasiteSuperMethod](target, prop),           
                    set: (target:any, prop:string, value:any) =>{                    
                        return this[SetParasiteSuperMethod](target, prop, value)
                    }
                });
                if(this.super){ delete this.super;};
                // 
                Object.defineProperty(this, 'super', {
                    get:()=>superProxy
                })
            }
        }
        
        /**
         * 
         * @param target 
         * @param methodName 
         * @returns 
         */
        [GetParasiteSuperMethod](target:any, methodName:string):Function{
            if(!target || !target._$super){
                return undefined;
            }
            const originMethodName:string = this[GetOriginMethodName](methodName);
            const thisDesc:PropertyDescriptor = js.getPropertyDescriptor(target, originMethodName);
            if(thisDesc && thisDesc.get){
                return thisDesc.get.call(target._$super)
            }else if(thisDesc && thisDesc.value && typeof thisDesc.value == 'function'){
                return thisDesc.value.bind(target._$super)
            }else{
                const desc:PropertyDescriptor = js.getPropertyDescriptor(target._$super, methodName);
                if(desc && desc.get){
                    return desc.get.call(target._$super)
                }else if(desc && Object.prototype.hasOwnProperty.call(desc, 'value')){
                    return desc.value;
                }else{
                    return this[GetParasiteSuperMethod](target._$super, methodName);
                }
            }
            // 
        }
        
        /**
         * 
         * @param target 
         * @param methodName 
         * @param value 
         * @returns 
         */
        [SetParasiteSuperMethod](target:any, methodName:string, value:any = undefined):boolean{
            if(!target || !target._$super){
                return false
            }
            const originMethodName:string = this[GetOriginMethodName](methodName);
            const thisDesc:PropertyDescriptor = js.getPropertyDescriptor(target, originMethodName)
            if(thisDesc && thisDesc.set){
                thisDesc.set.call(target._$super, value)
                return true;
            }else{
                const desc:PropertyDescriptor = js.getPropertyDescriptor(target._$super, methodName)
                if(desc && desc.set){
                    desc.set.call(target._$super, value);
                    return true;
                }else if(desc && Object.prototype.hasOwnProperty.call(desc, 'value')){
                    target._$super[methodName] = value;
                    return true;
                }else{
                    return this[SetParasiteSuperMethod](target._$super, methodName, value);
                }
            }
        }

        /**
         * 
         * @param methodName 
         * @returns 
         */
        [GetOriginMethodName](methodName:string):string{
            return '__$super::'+ methodName + '__';
        }

    }
    return Parasitified as unknown as Constructor<Component&IParasitified>;
})




