import { Component, Constructor, _decorator } from "cc";
import { IDecoratified } from "../types/ModifierType";
import { DefaultModifierState, Modifierify, getTokenSet } from "./Modifierify";
import { EDITOR } from "cc/env";
const { ccclass } = _decorator;

@ccclass('DecorateIdentifier')
class DecoratorState extends DefaultModifierState{
    // static record()
}

/**
 * 
 */
export default Modifierify<IDecoratified>(function Decoratify<TBase>(base:Constructor<TBase>):Constructor<TBase & IDecoratified>{
    class Decoratified extends (base as unknown as Constructor<Component>) implements IDecoratified {       

        


        public get internalOnLoad (): (() => void) | undefined {
            if(EDITOR){
                // enumifyProperty(this,)
            }
            // 
            return super['internalOnLoad']
        }
    } 
    

    // storage.set()
    return Decoratified as unknown as Constructor<TBase & IDecoratified>
}, DecoratorState)

// export function recordDecorator(target:any, modifier:Function){
//     getTokenSet(target.constructor, )
// }


