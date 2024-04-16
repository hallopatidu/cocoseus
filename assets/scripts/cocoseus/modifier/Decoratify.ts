import { Component, Constructor } from "cc";
import { IDecoratified } from "../types/ModifierType";
import { Modifierify, enumifyProperty } from "./Modifierify";
import { EDITOR } from "cc/env";

/**
 * 
 */
export default Modifierify<IDecoratified, string>(function Decoratify<TBase>(base:Constructor<TBase>):Constructor<TBase & IDecoratified>{
    class Decoratified extends (base as unknown as Constructor<Component>) implements IDecoratified {
        public get internalOnLoad (): (() => void) | undefined {
            if(EDITOR){
                // enumifyProperty(this,)
            }
            // 
            return super['internalOnLoad']
        }
    }
    return Decoratified as unknown as Constructor<TBase & IDecoratified>
})


