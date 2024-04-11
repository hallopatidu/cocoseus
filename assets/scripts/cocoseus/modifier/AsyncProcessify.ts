import { _decorator, Component, Constructor, Node } from 'cc';
import { IAsyncProcessified } from '../types/ModifierType';
import { hasModifierImplement } from './Classify';
const { ccclass, property } = _decorator;
export const ModifierName:string = 'AsyncProcessified';
/**
 * 
 * @param base 
 * @returns 
 */
export default function AsyncProcessify(base:any):Constructor<typeof base & IAsyncProcessified>{
    // 
    if(hasModifierImplement(base, ModifierName)){
        return base as unknown as any
    }else{
        // 
        class AsyncProcessified extends (base as unknown as Constructor<any>) implements IAsyncProcessified {
            private _waitingHandler: Function[] = [];
            async waitForReady(){
                if(this._waitingHandler){
                    await new Promise((resolve:Function)=>{
                        this._waitingHandler.push(resolve);
                    })
                }
            }

            execute(){
                this._waitingHandler = [];
            }

            ready(data?:any){
                if(this._waitingHandler && this._waitingHandler.length){
                    while(this._waitingHandler.length){
                        const resolveFunc:Function = this._waitingHandler.shift();
                        resolveFunc(data);
                    }                
                }
                this._waitingHandler = null
            }
        }

        return AsyncProcessified as unknown as Constructor<typeof base & IAsyncProcessified>;
    }
}
