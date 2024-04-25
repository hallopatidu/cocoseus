import { EDITOR } from "cc/env";
import { Component, Constructor, _decorator, log } from "cc";
import { Action, IOneFlowified, IStaticOneFlowified } from "../types/ModifierType";

import { Inheritancify } from "./Inheritancify";
import Referencify from "./Referencify";
import Decoratify from "./Decoratify";
// import Referencify from "./Referencify";
// const { ccclass, property } = _decorator;

// export const ModifierName:string = 'OneFlowified';

// const FunctionStorage:Map<number, Function> = new Map<number, Function>();
// // const PriorityMapper:Map<number, number> = new Map<number, number>()
// const FunctionToken = Symbol();
// const ActionToken = Symbol();
// const ReferenceStorage:Map<number, ReferenceInfo> = new Map<number, ReferenceInfo>();
// const ActionStorage:Map<number, Vec3[]> = new Map<number, Vec3[]>();

export default Inheritancify<IOneFlowified, IStaticOneFlowified>(function OneFlowify <TBase>(base:Constructor<TBase>):Constructor<TBase & IOneFlowified>{    
    /**
     * Injector class
     */
    class OneFlowified extends Referencify(base as unknown as Constructor<Component>) implements IOneFlowified {
        dispatch(action:Action, ...receiver:string[]):void {}
        public get internalOnLoad (): (() => void) | undefined {
            if(EDITOR){
                // enumifyProperty(this,)
               
            }
            log('[' + this.constructor.name + '] save key :: ' + Decoratify(this).keys())
            // 
            return super['internalOnLoad']
        }

    }
    return OneFlowified as unknown as Constructor<TBase & IOneFlowified>
})

// export function action(type:string, priority:number = 0){
//     const actionType:string = type;
//     return function (that: any, propertyKey: string, descriptor: PropertyDescriptor) {
//         Decoratify(that).record(actionType + '::' +propertyKey.toString(), '@action')
//         return descriptor;
//     }
// }

/**
 * <TSuper,TBase = Component>
 * @param base 
 * @returns 
 */
// export default function OneFlowify<TBase>(base:Constructor<TBase>):Constructor<TBase & IOneFlowified>{   
//     return base as unknown as any
//     // if(hasModifierImplement(base, ModifierName)){
//     //     return base as unknown as any
//     // }else{        
//     //     class OneFlowified extends (base as unknown as Constructor<Component>) implements IOneFlowified {
            
//     //         // @property({visible:false})
//     //         // token:number = null
//     //         /**
//     //          * 
//     //          */
//     //         public get internalOnLoad (): (() => void) | undefined {
//     //             oneFlowRegister(this)
//     //             return super['internalOnLoad']
//     //         }

//     //         /**
//     //          * 
//     //          * @param action 
//     //          * @param receiver 
//     //          */
//     //         dispatch(action:Action, ...receiver:string[]):void {
                
//     //         }

//     //         wait(oneFlowComponent:Component|string, actionType?:string){

//     //         }
//     //     }
//     //     return OneFlowified as unknown as Constructor<TBase & IOneFlowified>
//     // }
//     // return (hasModifierImplement(base, ModifierName) ? base : remakeClassInheritance(base, OneFlowComponent, Component)) as unknown as Constructor<TBase & IOneFlowified>
// }

// OneFlowify.REFERENCE = Enum({
//     GLOBAL:0,
//     SCEEN:1
// })

// --------------------------------------

/**
 * 
 * @param comp 
 * @returns token of record
 */
// function referenceRegister(comp:Component):number{
//     const constructor:any = comp.constructor;
//     if(comp.node){
//         const hierachyPath:string = comp.node.getPathInHierarchy();
//         const compName:string = constructor.name;
//         const orderIndex:number = comp.node.getComponents(constructor).findIndex((_comp:Component)=>_comp === comp)||0;
//         // 
//         const token:number = Support.tokenize(hierachyPath, compName, orderIndex.toString());
//         if(!ReferenceStorage.has(token)){
//             const refInfo:IReferenceInfo = {
//                 node:hierachyPath,
//                 comp:compName,
//                 id:orderIndex
//             } as IReferenceInfo
//             ReferenceStorage.set(token, refInfo);
//         }else{
//             warn('Reference is declared')            
//         }
//         return token
//     }
//     return -1;
// }

// function oneFlowRegister(comp:IOneFlowified&Component){
//     const refToken:number = referenceRegister(comp)
//     const constructor:any = comp.constructor;
//     if(!!constructor[ActionToken] || (constructor[ActionToken] as Set<number>).size){
//         const actionSet:Set<number> = constructor[ActionToken];
//         const iteratorVec3:IterableIterator<number> = actionSet.values();
//         // let actionVec:Vec3 = ActionStorage.get(iteratorVec3.next().value);
//         // while(actionVec){
//         //     actionVec.x = refToken;             
//         //     actionVec = ActionStorage.get(iteratorVec3.next().value);
//         // }        
        
//     }else{
//         DEV && warn('The component has OneFlow Modifier but there is no @action decorate which is used !');
//     }
    
// }

// ------------ Decorator ---------------

/**
 * '@audio'             Developer can choose a Sound in all of AudioReference exist in Scene at that time. Using default AudioReference.Enum 
 * '@audio(String)'     The developer defines a key of a specific AudioReference. Sound could not be played if this AudioReference is not exist.
 * '@audio(Enum)'       Developer can choose a Sound in Enum list.
 * @param options 
 */
// export function reference(options?: IPropertyOptions|string|unknown): LegacyPropertyDecorator;
// export function reference(type?: PropertyType): LegacyPropertyDecorator;
// export function reference(...args: Parameters<LegacyPropertyDecorator>): void;
// export function reference(
//     target?: Parameters<LegacyPropertyDecorator>[0]| PropertyType, 
//     propertyKey?: Parameters<LegacyPropertyDecorator>[1], 
//     descriptorOrInitializer?: BabelPropertyDecoratorDescriptor
// ){
//     let options: string|IPropertyOptions | PropertyType | null | unknown = null;    
//     function normalized (target: Parameters<LegacyPropertyDecorator>[0],
//         propertyKey: Parameters<LegacyPropertyDecorator>[1],
//         descriptorOrInitializer:  BabelPropertyDecoratorDescriptor)
//     {        
//         ((options ??= {}) as IPropertyOptions).type = Component;
//         const propertyNormalized:LegacyPropertyDecorator = property(options);
//         propertyNormalized(target as Parameters<LegacyPropertyDecorator>[0], propertyKey, descriptorOrInitializer);
//     }

//     if (target === undefined) {
//         // @audio() => LegacyPropertyDecorator
//         return reference({
//             type: Component,
//         });
//     } else if (typeof propertyKey === 'undefined') {
//         options = target;
//         return normalized;
//     } else {
//         // @audio
//         normalized(target as Parameters<LegacyPropertyDecorator>[0], propertyKey, descriptorOrInitializer);
//         return undefined;
//     }
// }


/**
 * cascade
 * @param stateName 
 * @returns 
 */
// export function action(type:string, priority:number = 0){
//     const actionType:string = type;
//     return function (that: any, propertyKey: string, descriptor: PropertyDescriptor) {
//         const constructor:Constructor = that.constructor;
//         if(DEV){
//             if(!hasImplement(constructor as Constructor, ModifierName)){
//                 error('You need add the OneFlowified Modifier for this class to use @action');
//             }
//         }
//         // 
//         const functionToken:number = Support.tokenize(type||'Default', constructor.name, propertyKey.toString());
//         if(!FunctionStorage.has(functionToken)){
//             // Luu callback funtion tuong ung token
//             const callback:Function = async function () {
//                 const returnValue:any = descriptor.value.apply(this, Array.from(arguments));
//                 return (typeof returnValue === 'object' && typeof returnValue.then === 'function') ? returnValue : await returnValue;
//             }
//             FunctionStorage.set(functionToken, callback); 
//             getTokenSet(constructor, FunctionToken).add(functionToken);
//         }else{
//             error('[OneFlowify] Duplicate method token ' + functionToken);
//         }

//         const actionToken:number = Support.tokenize(actionType);
//         if(!ActionStorage.has(actionToken)){
//             const vecList:Vec3[] = ActionStorage.get(actionToken) || [];
//             vecList.push(new Vec3(functionToken, priority));
//             ActionStorage.set(actionToken, vecList);
//             getTokenSet(constructor, ActionToken).add(actionToken);
//         }
//         // Save prioryty
//         // PriorityMapper.set(token, priority);
           
//         // if(!OneFlowMapper.has(actionType)){
//         //     OneFlowMapper.set(actionType, []);
//         // }
//         // let oneFlowInfos:IOneFlowInfo[] = OneFlowMapper.get(actionType);
//         // const oneFlowInfo:IOneFlowInfo = Object.create(null)
//         // const className:string = this.constructor.name;
        
//         // if(!oneFlowInfos){
            
//         // }
//         // descriptor.configurable = value;
//         // const originMethod:Function = descriptor.value;
//         // const constructor: any = target.constructor;
//         // // 
//         // if(!constructor[RENDER_MAP]){
//         //     constructor[RENDER_MAP] = new Map<string, string[]>();
//         // }
//         // // 
//         // const methods:string[] = (constructor[RENDER_MAP] as Map<string, string[]>).get(stateName.toString()) || [];
//         // if(methods.indexOf(propertyKey) == -1){                
//         //     (constructor[RENDER_MAP] as Map<string, string[]>).set(stateName.toString(), methods.concat(propertyKey));
//         // }
//         // // 
//         // descriptor.value = function():Promise<any>{
//         //     const returnValue:any = originMethod.apply(this, Array.from(arguments));
//         //     return (typeof returnValue === 'object' && typeof returnValue.then === 'function') ? returnValue : Promise.resolve(returnValue);
//         // }
//         return descriptor;
//     };
// }

