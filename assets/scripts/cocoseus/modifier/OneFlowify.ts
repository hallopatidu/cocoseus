import { DEV } from "cc/env";
import { hasModifierImplement, remakeClassInheritance, mixinClass } from "./Inheritancify";
import { Component, Constructor, Enum, _decorator, error, js, log, warn } from "cc";
import { Action, BabelPropertyDecoratorDescriptor, IOneFlowInfo, IOneFlowified, IPropertyOptions, LegacyPropertyDecorator, PropertyType } from "../types/ModifierType";
import { Support } from "../utils/Support";
const { ccclass, property } = _decorator;

export const ModifierName:string = 'OneFlowified';

const MethodMapper:Map<number, Function> = new Map<number, Function>();

// const ComponentsOnFlow = Symbol()

// @ccclass('OneFlowComponent')
// export class OneFlowComponent extends Component implements IOneFlowified{
//     dispatch(action:Action, ...receiver:string[]):void {
        
//     }

//     wait(){

//     }
// }

// const modifiedDest:PropertyDescriptor = js.getPropertyDescriptor(js, 'isChildClassOf')
// modifiedDest.value = ((oldMethod:Function)=>{
//     return function(subclass: unknown, superclass: unknown):boolean{
//         return oldMethod.call(this, subclass, superclass) //|| hasModifierImplement()
//     }
// })(modifiedDest.value)


/**
 * <TSuper,TBase = Component>
 * @param base 
 * @returns 
 */
export default function OneFlowify<TBase>(base:Constructor<TBase>):Constructor<TBase & IOneFlowified>{   
    if(hasModifierImplement(base, ModifierName)){
        return base as unknown as any
    }else{        
        class OneFlowified extends (base as unknown as Constructor<Component>) implements IOneFlowified {
            
            @property({visible:false})
            token:number = null
            /**
             * 
             */
            public get internalOnLoad (): (() => void) | undefined {
                const hierachyPath:string = this.node.getPathInHierarchy();
                log('Token name:: ' + this.token)
                return super['internalOnLoad']
            }

            /**
             * 
             * @param action 
             * @param receiver 
             */
            dispatch(action:Action, ...receiver:string[]):void {
                
            }

            wait(oneFlowComponent:Component|string, actionType?:string){

            }
        }
        return OneFlowified as unknown as Constructor<TBase & IOneFlowified>
    }
    // return (hasModifierImplement(base, ModifierName) ? base : remakeClassInheritance(base, OneFlowComponent, Component)) as unknown as Constructor<TBase & IOneFlowified>
}

OneFlowify.REFERENCE = Enum({
    GLOBAL:0,
    SCEEN:1
})



// --------------------------------------
function generateOneFlowKey(actionType:string, className:string, methodName:string):string{
    // if(!this.node) return error('Can not load component.')
    // const hierachyPath:string = this.node.getPathInHierarchy();
    return "["+actionType + "]" + className + '.' + methodName;
}

// ------------ Decorator ---------------

/**
 * '@audio'             Developer can choose a Sound in all of AudioReference exist in Scene at that time. Using default AudioReference.Enum 
 * '@audio(String)'     The developer defines a key of a specific AudioReference. Sound could not be played if this AudioReference is not exist.
 * '@audio(Enum)'       Developer can choose a Sound in Enum list.
 * @param options 
 */
export function reference(options?: IPropertyOptions|string|unknown): LegacyPropertyDecorator;
export function reference(type?: PropertyType): LegacyPropertyDecorator;
export function reference(...args: Parameters<LegacyPropertyDecorator>): void;
export function reference(
    target?: Parameters<LegacyPropertyDecorator>[0]| PropertyType, 
    propertyKey?: Parameters<LegacyPropertyDecorator>[1], 
    descriptorOrInitializer?: BabelPropertyDecoratorDescriptor
){
    let options: string|IPropertyOptions | PropertyType | null | unknown = null;    
    function normalized (target: Parameters<LegacyPropertyDecorator>[0],
        propertyKey: Parameters<LegacyPropertyDecorator>[1],
        descriptorOrInitializer:  BabelPropertyDecoratorDescriptor)
    {        
        ((options ??= {}) as IPropertyOptions).type = Component;
        const propertyNormalized:LegacyPropertyDecorator = property(options);
        propertyNormalized(target as Parameters<LegacyPropertyDecorator>[0], propertyKey, descriptorOrInitializer);
    }

    if (target === undefined) {
        // @audio() => LegacyPropertyDecorator
        return reference({
            type: Component,
        });
    } else if (typeof propertyKey === 'undefined') {
        options = target;
        return normalized;
    } else {
        // @audio
        normalized(target as Parameters<LegacyPropertyDecorator>[0], propertyKey, descriptorOrInitializer);
        return undefined;
    }
}


/**
 * cascade
 * @param stateName 
 * @returns 
 */
export function action(type:string, priority?:number){
    const actionType:string = type;
    return function (that: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const constructor:Constructor = that.constructor;
        if(DEV){
            if(!hasModifierImplement(constructor as Constructor, ModifierName)){
                error('You need add the OneFlowified Modifier for this class to use @action');
            }
        }
        // 
        const key:string = generateOneFlowKey(type, constructor.name, propertyKey);
        const token:number = Support.hashString(key);
        const callback:Function = async function () {
            const returnValue:any = descriptor.value.apply(this, Array.from(arguments));
            return (typeof returnValue === 'object' && typeof returnValue.then === 'function') ? returnValue : await returnValue;
        }
        if(!MethodMapper.has(token)){
            MethodMapper.set(token, callback);
            that.token = token;
        }else{
            error('[OneFlowify] Duplicate method key ' + key)
        }
        
        // if(!OneFlowMapper.has(actionType)){
        //     OneFlowMapper.set(actionType, []);
        // }
        // let oneFlowInfos:IOneFlowInfo[] = OneFlowMapper.get(actionType);
        // const oneFlowInfo:IOneFlowInfo = Object.create(null)
        // const className:string = this.constructor.name;
        
        // if(!oneFlowInfos){
            
        // }
        // descriptor.configurable = value;
        // const originMethod:Function = descriptor.value;
        // const constructor: any = target.constructor;
        // // 
        // if(!constructor[RENDER_MAP]){
        //     constructor[RENDER_MAP] = new Map<string, string[]>();
        // }
        // // 
        // const methods:string[] = (constructor[RENDER_MAP] as Map<string, string[]>).get(stateName.toString()) || [];
        // if(methods.indexOf(propertyKey) == -1){                
        //     (constructor[RENDER_MAP] as Map<string, string[]>).set(stateName.toString(), methods.concat(propertyKey));
        // }
        // // 
        // descriptor.value = function():Promise<any>{
        //     const returnValue:any = originMethod.apply(this, Array.from(arguments));
        //     return (typeof returnValue === 'object' && typeof returnValue.then === 'function') ? returnValue : Promise.resolve(returnValue);
        // }
        return descriptor;
    };
}