import { DEV } from "cc/env";
import { hasModifierImplement } from "./Classify";
import { Constructor, error } from "cc";
import { Action, IOneFlowified } from "../types/ModifierType";

export const ModifierName:string = 'OneFlowified';

/**
 * 
 * @param stateName 
 * @returns 
 */
export function action(type:string){
    const actionType:string = type;
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const constructor:Constructor = target.constructor;
        if(DEV){
            if(!hasModifierImplement(constructor as Constructor, ModifierName)){
                error('You need add the OneFlowified Modifier for this class to use @action');
            }
        }
        // 
        
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
    };
}

/**
 * 
 * @param base 
 * @returns 
 */
export default function OneFlowify(base:Constructor):Constructor<typeof base & IOneFlowified>{
    if(hasModifierImplement(base, ModifierName)){
        return base as unknown as any;
    }else{
        class OneFlowified extends (base as unknown as any) implements IOneFlowified{
            dispatch(action:Action, ...receiver:string[]):void {
                
            }
        }

        return OneFlowified as unknown as Constructor<typeof base & IOneFlowified>
    }
}


// ---------------------------