import { Component, Constructor, error, js, warn, _decorator } from "cc";
import { DEV, EDITOR } from "cc/env";
import { hasModifierImplement } from "./Classify";
import { IParasitified } from "../types/ModifierType";
const { property } = _decorator;

export const ModifierName:string = 'Parasitified'
export const OverrideMethodNameMap = Symbol();




/**
 * Can add override method for this method.
 * @param target 
 * @param propertyKey 
 * @param descriptor 
 */
export function override(target: Component, propertyKey: string, descriptor: PropertyDescriptor){
    // if(propertyKey === '__preload') {
    //     error('Do not support overriding ' + propertyKey + ' method');
    //     return;
    // }     
    if(DEV){
        if(!hasModifierImplement(target.constructor as Constructor, ModifierName)){
            error('You need add the Parasitify Modifier for this class to use @override');
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
    //     
}

/**
 * 
 * @param base 
 * @returns 
 */
export default function Parasitify<TSuper,TBase = Component>(base:Constructor<TBase>):Constructor<TBase & IParasitified<TSuper>>{
    if(hasModifierImplement(base, ModifierName)){
        return base as unknown as any
    }else{
        class Parasitified extends (base as unknown as Constructor<Component>) implements IParasitified<TSuper>{
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

            private _superProxy:any;

            get super():TSuper {      
                if(!this._$super) error('Do not init super !');
                if(!this._superProxy){
                    this._superProxy = new Proxy(this, {  
                        get: (target:any, prop:string) => getParasiteSuperMethod(target, prop),           
                        set: (target:any, prop:string, value:any) =>{                    
                            return setParasiteSuperMethod(target, prop, value)
                        }
                    })
                }
                return this._superProxy as TSuper
            };

            public get internalOnLoad (): (() => void) | undefined {
                excuteHierarchyOverridding(this);
                return super['internalOnLoad']
            }
        }

        return Parasitified as unknown as Constructor<TBase & IParasitified<TSuper>>
    }
}

// -------------------------

/**
 * 
 * @param component 
 * @returns 
 */
function checkEligibleForInheritance(component:Component):boolean{    
    return EDITOR ?  Boolean(!!component && component.enabled) : !!component 
}


/**
     * 
     */
function excuteHierarchyOverridding(thisComp:Component){ 
    if(!thisComp.node) return;
    const allNodeComponents:ReadonlyArray<Component> = thisComp.node.components;
    const numberOfComponent:number = allNodeComponents.length;
    let hostComp:Component = null;
    let firstParasite:Component = null;        
    const previousCompIndex:number = allNodeComponents.findIndex((component:Component, index:number, allComponents:Component[])=>{
        const eligibleForInheritance:boolean = checkEligibleForInheritance(component)          
        let investigateComp:Component = null;
        if(eligibleForInheritance){
            // const componentIsParasite:boolean = js.isChildClassOf(component.constructor, parasiteClass); 
            const componentIsParasite:boolean = hasModifierImplement(component.constructor as Constructor, ModifierName);            
            hostComp = componentIsParasite ? hostComp : component;                
            let enabledIndex:number = index;
            // Search enabled nextComp
            while(enabledIndex < numberOfComponent - 1){
                investigateComp = allComponents[++enabledIndex];
                if(checkEligibleForInheritance(investigateComp)){                    
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
        return eligibleForInheritance && investigateComp && (investigateComp == thisComp);
    })
    // 
    thisComp['_$id'] = previousCompIndex + 1;
    const previousComponent:Component = allNodeComponents[previousCompIndex];
    if(previousComponent){
        thisComp['_$super'] = previousComponent;
        thisComp['_$superName'] = js.getClassName(previousComponent);
        // Find a final Parasite Component. Do not need at this time.
        // let isFinalParasite:boolean = false;
        // const nextComponent:Component = previousCompIndex < numberOfComponent - 2 ? allNodeComponents[previousCompIndex + 2] : null;
        // if(!nextComponent || (nextComponent && !js.isChildClassOf(nextComponent.constructor, ParasiteComponent))){
        //     // the last Parasite Component.       
        //     isFinalParasite = true;
        // }
    }
    // 
    if(thisComp['_$super']){
        const listOfOverrideMethods:Set<string> = thisComp[OverrideMethodNameMap];
        listOfOverrideMethods && listOfOverrideMethods.forEach((methodName:string)=>{
            const hostDesc:PropertyDescriptor = js.getPropertyDescriptor(hostComp, methodName);
            if(hostDesc){
                const originMethodName:string = GetOriginMethodName(methodName);
                const thisDesc:PropertyDescriptor = js.getPropertyDescriptor(thisComp, methodName);
                if(firstParasite && !Object.prototype.hasOwnProperty.call(firstParasite, originMethodName)){    
                    // the first parasite saved all origin method.                
                    Object.defineProperty(firstParasite, originMethodName, hostDesc);
                }
                // 
                if(thisDesc && firstParasite){
                    if(hostDesc.get || hostDesc.set){                          
                        delete hostComp[methodName];
                        js.getset(hostComp, 
                            methodName, 
                            thisDesc.get ? thisDesc.get.bind(thisComp) : hostDesc.get.bind(hostComp), 
                            thisDesc.set ? thisDesc.set.bind(thisComp) : hostDesc.set.bind(hostComp),
                            thisDesc.enumerable, 
                            thisDesc.configurable);

                    }else if(hostDesc.value !== undefined && typeof hostDesc.value == 'function'){
                        js.value(hostComp,
                            methodName,
                            thisDesc.value ? thisDesc.value.bind(thisComp) : hostDesc.value.bind(hostComp), 
                            thisDesc.writable || hostDesc.writable,
                            thisDesc.enumerable || hostDesc.enumerable);
                        
                    }else{                            
                        // If method is a normal attribute of host's class but you want to convert it to be a get/set method.                            
                        if(thisDesc.get || thisDesc.set){                                
                            js.getset(hostComp, 
                                methodName, 
                                thisDesc.get ? thisDesc.get.bind(thisComp) : ()=>{
                                    return firstParasite[originMethodName]
                                } ,         
                                thisDesc.set ? thisDesc.set.bind(thisComp): (value:any)=>{
                                    firstParasite[originMethodName] = value
                                }, 
                                thisDesc.enumerable,
                                thisDesc.configurable)
                        }
                    }                        

                }else{
                    delete thisComp[originMethodName];
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

// ------- Super -----------

/**
     * 
     * @param methodName 
     * @returns 
     */
function GetOriginMethodName(methodName:string):string{
    return '__$super::'+ methodName + '__';
}

/**
     * 
     * @param target 
     * @param methodName 
     * @returns 
     */
function getParasiteSuperMethod(target:any, methodName:string):Function{
    if(!target || !target._$super){
        return undefined;
    }
    const originMethodName:string = GetOriginMethodName(methodName);
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
            return getParasiteSuperMethod(target._$super, methodName);
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
function setParasiteSuperMethod(target:any, methodName:string, value:any = undefined):boolean{
    if(!target || !target._$super){
        return false
    }
    const originMethodName:string = GetOriginMethodName(methodName);
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
            return setParasiteSuperMethod(target._$super, methodName, value);
        }
    }
}
