import { Component, Constructor, _decorator, log } from "cc";
import { IDecoratified, IStaticDecoratified } from "../types/CoreType";
import { Inheritancify } from "./Inheritancify";

export const DecoratifyName:string = 'Decoratify';
const DecoratedTag = '__$decorated';


class ClassRecorder {
    /**
     * 
     * @param key 
     * @param tag 
     * @returns 
     */
    static record(key:string, tag:string = DecoratedTag):boolean{
        const customTag:string = tag !== DecoratedTag ? '__$'+tag: DecoratedTag;
        if(!this[customTag]) this[customTag] = new Set<string>();
        if((this[customTag] as Set<string>).has(key)) return false;
        (this[customTag] as Set<string>).add(key);
        return true
    }

    /**
     * 
     * @param key 
     * @param tag 
     */
    static remove(key:string, tag:string = DecoratedTag){
        const customTag:string = tag !== DecoratedTag ? '__$'+tag: DecoratedTag;
        if(this[customTag] && (this[customTag] as Set<string>).has(key)) (this[customTag] as Set<string>).delete(key);
        else return false;
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
}

export function ClassRecord(constructor:Constructor):ClassRecorder{

    return ClassRecorder
}


/**
 * 
 */
export default Inheritancify<IDecoratified, IStaticDecoratified>(function Decoratify<TBase>(base:Constructor<TBase>):Constructor<TBase & IDecoratified>{
    /**
     * Injector class
     */
    class Decoratified extends (base as unknown as Constructor<Component>) implements IDecoratified {

        /**
         * 
         * @param key 
         * @param tag 
         * @returns 
         */
        static record(key:string, tag:string = DecoratedTag):boolean{
            const customTag:string = tag !== DecoratedTag ? '__$'+tag: DecoratedTag;
            if(!this[customTag]) this[customTag] = new Set<string>();
            if((this[customTag] as Set<string>).has(key)) return false;
            (this[customTag] as Set<string>).add(key);
            return true
        }

        /**
         * 
         * @param key 
         * @param tag 
         */
        static remove(key:string, tag:string = DecoratedTag){
            const customTag:string = tag !== DecoratedTag ? '__$'+tag: DecoratedTag;
            if(this[customTag] && (this[customTag] as Set<string>).has(key)) (this[customTag] as Set<string>).delete(key);
            else return false;
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

    };
    // 
    return Decoratified as unknown as Constructor<TBase & IDecoratified>
}, DecoratifyName)




