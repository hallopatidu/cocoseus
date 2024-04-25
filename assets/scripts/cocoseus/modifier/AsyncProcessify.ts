import { _decorator, Constructor } from 'cc';
import { IAsyncProcessified } from '../types/ModifierType';
import { hadInjectorImplemented } from './Inheritancify';

const { ccclass, property } = _decorator;
const ModifierName:string = 'AsyncProcessified';
/**
 * 
 * @param base 
 * @returns 
 */
export default function AsyncProcessify<TBase>(base:Constructor<TBase>):Constructor<TBase & IAsyncProcessified>{
    // 
    if(hadInjectorImplemented(base, ModifierName)){
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

        return AsyncProcessified as unknown as Constructor<TBase & IAsyncProcessified>;
    }
}
