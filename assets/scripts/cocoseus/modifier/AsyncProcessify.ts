import { _decorator, Constructor, js, log } from 'cc';
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

            private waitingTasks: Map<number, Function[]> = new Map();

            /**
             * 
             * @param token 
             * @returns 
             */
            async wait<TNextData = unknown>(token:number = -1):Promise<TNextData>{
                let waitingHandlers:Function[] = this.waitingTasks.get(token);
                if(waitingHandlers){
                    return await new Promise((resolve:Function)=>{
                        waitingHandlers.push(resolve);
                    })         
                }
            }

            /**
             * 
             * @param token 
             */
            begin(token:number = -1){
                // this._waitingHandler = [];
                !this.waitingTasks.has(token) && this.waitingTasks.set(token, []);
            }

            /**
             * 
             * @param token 
             * @param data 
             */
            end(token:number=-1, data?:any){
                if(this.waitingTasks.has(token)){
                    const waitingHandlers:Function[] = this.waitingTasks.get(token);
                    while(waitingHandlers.length){
                        const resolveFunc:Function = waitingHandlers.shift();
                        resolveFunc(data);
                    }  
                    this.waitingTasks.delete(token);
                }
                log('end ----- ' + token + ' \n')
                this.waitingTasks.size == 0 && log('All completed !!')
            }

        }

        return AsyncProcessified as unknown as Constructor<TBase & IAsyncProcessified>;
    }
}
