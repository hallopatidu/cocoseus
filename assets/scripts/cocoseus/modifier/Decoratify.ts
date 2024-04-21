import { Component, Constructor } from "cc";
import { IDecoratified } from "../types/ModifierType";
import { Modifierify, ModifierStorage } from "./Modifierify";
import { EDITOR } from "cc/env";

/**
 * 
 */
export default Modifierify<IDecoratified, string>(function Decoratify<TBase>(base:Constructor<TBase>):Constructor<TBase & IDecoratified>{
    class Decoratified extends (base as unknown as Constructor<Component>) implements IDecoratified {
        private _storage:ModifierStorage<string>;
        get storage():ModifierStorage<string>{
            if(!this._storage){
                this._storage = new ModifierStorage<string>(Decoratify)
            }
            return this._storage;
        }

        record(propertyKey:string){
            let data:string[] = this.storage.select(propertyKey)
            if(!data) {
                data = []
                this.storage.record(propertyKey, data)
            }
            data.push(propertyKey);
        }

        *token():Generator<string>{
            const decorateKey:string[] = this.storage.select(this.constructor.name);
            if(decorateKey && decorateKey.length){
                for (let index = 0; index < decorateKey.length; index++) {
                    const key:string = decorateKey[index];
                    yield key;
                }
            }
        }

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
})



