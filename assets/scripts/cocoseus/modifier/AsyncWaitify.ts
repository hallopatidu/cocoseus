import { Component, Constructor, log } from "cc";
import { IAsyncWaited, IStaticAsyncWaited } from "../types/ModifierType";
import { Inheritancify } from "./Inheritancify";
import Storagify from "./Storagify";


/**
 * 
 */
export default Inheritancify<IAsyncWaited, IStaticAsyncWaited>(function AsyncWaitify<TBase>(base:Constructor<TBase>):Constructor<TBase & IAsyncWaited>{
    class AsyncWaited extends Storagify(base as unknown as Constructor<Component>) implements IAsyncWaited {

        private static _waitingTasks: Map<number, Function[]>;
        
        static get waitingTasks(){
            if(!this._waitingTasks){
                this._waitingTasks = Storagify(this).table<Function[]>(AsyncWaitify.name);
            }
            return this._waitingTasks
        }

        /**
         * 
         * @param token 
         */
        static async begin(token:number=-1){
            log('\n ------ Begin ' + token)
            !this.waitingTasks.has(token) && this.waitingTasks.set(token, []);
        }

        /**
         * 
         * @param target 
         */
        static async wait<TNextData = unknown>(token:number = -1):Promise<TNextData>{   
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
         * @param data 
         */
        static async end(token:number=-1, data?:any){
            if(this.waitingTasks.has(token)){
                const waitingHandlers:Function[] = this.waitingTasks.get(token);
                while(waitingHandlers.length){
                    const resolveFunc:Function = waitingHandlers.shift();
                    resolveFunc(data);
                }  
                delete this.waitingTasks[token];
            }
            log('end ----- ' + token + ' \n')
        }

    }

    return AsyncWaited as unknown as Constructor<TBase & IAsyncWaited>;
})
