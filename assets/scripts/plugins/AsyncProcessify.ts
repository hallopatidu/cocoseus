import { Component, Constructor, log } from "cc";
import { cocoseus_classify } from "../definition/cocoseus.classify";
const { CCClassify } = cocoseus_classify;

export interface IAsyncProcessified extends Component {
    wait<TNextData = unknown>(token?:number):Promise<TNextData>
    begin(token?:number):void
    end(token?:number, data?:any):void
    isProgressing(token?:number):boolean
}

export const AsyncProcessifiedClassName:string = "AsyncProcessifiedClass";
export default CCClassify<IAsyncProcessified>(function asyncProcessify<TBase=Component>(base:Constructor<TBase&IAsyncProcessified>):Constructor<TBase & IAsyncProcessified>{
    class AsyncProcessified extends (base as unknown as Constructor<Component>) {            
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

        isProgressing(token:number = -1):boolean{
            return this.waitingTasks.has(token);
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
    
}, AsyncProcessifiedClassName)