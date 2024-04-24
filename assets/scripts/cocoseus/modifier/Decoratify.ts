import { Component, Constructor, Label, _decorator, log } from "cc";
import { IDecoratified, IStaticDecoratified } from "../types/ModifierType";
import { DefaultModifierState, Modifierify, getTokenSet } from "./Modifierify";
import { EDITOR } from "cc/env";
import { Inheritancify } from "./Inheritancify";
const { ccclass } = _decorator;

// @ccclass('DecoratorState')
// class DecoratorState extends DefaultModifierState{
//     // static record()
// }
const DecoratedTag = '__$decorate'
/**
 * 
 */
export default Inheritancify<IDecoratified, IStaticDecoratified>(function Decoratify<TBase extends Constructor<Component>>(base:TBase):Constructor<TBase & IDecoratified>{
    /**
     * Injector class
     */
    class Decoratified extends (base as unknown as Constructor<Component>) implements IDecoratified {

        static record(key:string):boolean{
            if(!this[DecoratedTag]) this[DecoratedTag] = new Set<string>();
            if((this[DecoratedTag] as Set<string>).has(key)) return false;
            (this[DecoratedTag] as Set<string>).add(key);
            return true
        }

        static keys():string[]{
            if(!this[DecoratedTag]) this[DecoratedTag] = new Set<string>();
            return [...(this[DecoratedTag] as Set<string>)];
        }

        public get internalOnLoad (): (() => void) | undefined {
            if(EDITOR){
                // enumifyProperty(this,)
               
            }
            log('[' + this.constructor.name + '] save key :: ' + Decoratified.keys())
            // 
            return super['internalOnLoad']
        }
    };
    // 
    return Decoratified as unknown as Constructor<TBase & IDecoratified>
})




