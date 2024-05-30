import { _decorator, Constructor, js, log, warn } from 'cc';
import { IAsyncProcessified } from '../types/CoreType';
import { hadInjectorImplemented } from './Inheritancify';
import { DEV } from 'cc/env';

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
            private waitingTokens:Set<number> = new Set<number>();
            
            /**
             * 
             * @param token 
             * @returns 
             */
            async wait<TNextData = unknown>(token:number = -1):Promise<TNextData>{   
                if(token == -1) this.begin();             
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
                        resolveFunc && resolveFunc(data);
                    }  
                    this.waitingTasks.delete(token);
                    this.waitingTokens.delete(token);
                    // 
                }
                
                if(this.waitingTasks.size == 0) {
                    // DEV && warn('call from ' + token)
                    log('All completed !!')
                }
            }
            
        }

        return AsyncProcessified as unknown as Constructor<TBase & IAsyncProcessified>;
    }
}
