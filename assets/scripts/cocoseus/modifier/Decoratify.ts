import { Component, Constructor, Label, _decorator } from "cc";
import { IDecoratified } from "../types/ModifierType";
import { DefaultModifierState, Modifierify, getTokenSet } from "./Modifierify";
import { EDITOR } from "cc/env";
const { ccclass } = _decorator;

@ccclass('DecoratorState')
class DecoratorState extends DefaultModifierState{
    // static record()
}

type con = Constructor<Label>
/**
 * 
 */
export default Modifierify<IDecoratified>(function Decoratify<TBase extends Constructor<Component>>(base:TBase):Constructor<TBase & IDecoratified>{
    class Decoratified extends base implements IDecoratified {
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


