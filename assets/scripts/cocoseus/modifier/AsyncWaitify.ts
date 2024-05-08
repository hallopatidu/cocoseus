import { CCClass, CCObject, Component, Constructor, log } from "cc";
import { IAsyncProcessified, IAsyncWaited, IStaticAsyncWaited } from "../types/ModifierType";
import { Inheritancify } from "./Inheritancify";
import Storagify from "./Storagify";
import AsyncProcessify from "./AsyncProcessify";


class AsyncWaitedTask extends AsyncProcessify(CCObject) {
    
}

/**
 * 
 */
export default Inheritancify<IAsyncWaited, IStaticAsyncWaited>(function AsyncWaitify<TBase>(base:Constructor<TBase>):Constructor<TBase & IAsyncWaited>{
    class AsyncWaited extends Storagify(base as unknown as Constructor<Component>) implements IAsyncWaited {

        private static _waitingMap: Map<number, AsyncWaitedTask>; // Map< action token, Map<component token, resolve funtion> >
        
        static get waitingMap(){
            if(!this._waitingMap){
                this._waitingMap = Storagify(this).table<AsyncWaitedTask>(AsyncWaitify.name);
            }
            return this._waitingMap
        }
        

        /**
         * 
         * @param token 
         */
        static task(token:number):IAsyncProcessified{
            if(!this.waitingMap.has(token)){
                this.waitingMap.set(token, new AsyncWaitedTask());
            }
            return this.waitingMap.get(token);
        }

    }

    return AsyncWaited as unknown as Constructor<TBase & IAsyncWaited>;
})
