import { Component, Constructor, _decorator, log } from "cc";
import { IDecoratified, IStaticDecoratified } from "../types/ModifierType";
import { EDITOR } from "cc/env";
import { Inheritancify } from "./Inheritancify";


const DecoratedTag = '__$decorated'
const SelectedKey = '__$selected_key__'
/**
 * 
 */
export default Inheritancify<IDecoratified, IStaticDecoratified>(function Decoratify<TBase>(base:Constructor<TBase>):Constructor<TBase & IDecoratified>{
    /**
     * Injector class
     */
    class Decoratified extends (base as unknown as Constructor<Component>) implements IDecoratified {

        static get selectedKey():string{
            return this[SelectedKey];
        }

        /**
         * 
         * @param key 
         * @param tag 
         * @returns 
         */
        static record(key:string, tag:string = DecoratedTag):boolean{
            const customeTag:string = tag !== DecoratedTag ? '__$'+tag: DecoratedTag;
            if(!this[customeTag]) this[customeTag] = new Set<string>();
            if((this[customeTag] as Set<string>).has(key)) return false;
            (this[customeTag] as Set<string>).add(key);
            this[SelectedKey] = key;
            return true
        }

        /**
         * 
         * @param tag 
         * @returns 
         */
        static keys(tag:string = DecoratedTag):string[]{
            const customeTag:string = tag !== DecoratedTag ? '__$'+tag: DecoratedTag;
            if(!this[customeTag]) this[customeTag] = new Set<string>();
            return [...(this[customeTag] as Set<string>)];
        }

        // public get internalOnLoad (): (() => void) | undefined {
        //     if(EDITOR){
        //         // enumifyProperty(this,)
               
        //     }
        //     log('[' + this.constructor.name + '] save key :: ' + Decoratified.keys())
        //     // 
        //     return super['internalOnLoad']
        // }
    };
    // 
    return Decoratified as unknown as Constructor<TBase & IDecoratified>
})




