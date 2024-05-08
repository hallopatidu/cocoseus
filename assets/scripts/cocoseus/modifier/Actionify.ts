import { Component, Constructor, error, find, js, log, warn } from "cc";
import { Action, IActionized, IAsyncProcessified, IAsyncWaited, IStaticActionized } from "../types/ModifierType";
import { Inheritancify } from "./Inheritancify";
import Storagify from "./Storagify";
import Decoratify from "./Decoratify";
import Referencify from "./Referencify";
import { Support } from "../utils/Support";
import { DEBUG, DEV, EDITOR } from "cc/env";
import AsyncWaitify from "./AsyncWaitify";


const ActionTaskDB:{[n:number]:ActionTaskInfo} = Object.create(null);

type ActionTaskInfo = {
    pending:{[n:number]:boolean},
    handled:{[n:number]:boolean},
    action:Action,
    generator?:Generator<Function>
}



/**
 * 
 */
export default Inheritancify<IActionized, IStaticActionized>(function Actionify<TBase>(base:Constructor<TBase>):Constructor<TBase & IActionized>{
    class Actionized extends Referencify(AsyncWaitify(base as unknown as Constructor<Component>)) implements IActionized, IAsyncWaited {
        
        private static _actions:Map<number, Map<number, string>>;

        static get actions(){
            if(!Actionized._actions){
                Actionized._actions = Storagify(this).table<Map<number, string>>(Actionify.name);
            }
            return Actionized._actions
        }

        protected _actionToken:number = -1;
        
        /**
         * 
         * @param action 
         * @param receiver 
         */
        async dispatch(action:Action, ...receiver:string[]){
            // 
            const actionToken:number = Support.tokenize(action.type);
            if(!ActionTaskDB[actionToken]){                
                // const actionFunctions:Map<number, string> = Actionized.actions.get(actionToken); // Map <reference token, handler function>
                // const actionKeys:number[] = [...actionFunctions.keys()];
                const taskInfo:ActionTaskInfo = {
                    pending:{}, // Dang xu ly goi vao day.
                    handled:{}, // action nao xong goi vao day.
                    action : action                                
                };
                // taskInfo.generator = this.generateExecutedFuntion(actionToken, taskInfo);
                // 
                const proxyHandler = {
                    get(target, prop) {                        
                        target._actionToken = actionToken;
                        return Reflect.get(target, prop);
                        
                    },
                    set(target, prop, value) {
                        target._actionToken = actionToken;                       
                        return Reflect.set(target, prop, value);
                    },
                }
                ActionTaskDB[actionToken] = taskInfo;
                // 
                this._startDispatching(action);
                try{
                    const taskPromises:Promise<any>[] = [];
                    const actionFunctions:Map<number, string> = Actionized.actions.get(actionToken); // Map <reference token, handler function>
                    const actionKeys:number[] = [...actionFunctions.keys()];
                    const progressTask:IAsyncProcessified = AsyncWaitify(this).task(actionToken)
                    // 
                    actionKeys.forEach((token:number)=>{
                        const comp:(TBase & IActionized) = Referencify(this).getComponent(token);
                        progressTask.begin(token);
                    })
                    // 
                    for (let index = 0; index < actionKeys.length; index++) {
                        const token:number = actionKeys[index];
                        const methodName:string = actionFunctions.get(token);
                        const comp:(TBase & IActionized) = Referencify(this).getComponent(token);
                        if(comp){       
                                             
                            taskPromises.push(new Promise(async (resolve:Function)=>{
                                // Sử dụng proxy với proxyHandler để đảm bảo this._actionToken không thay đổi khi gọi cùng lúc nhiều action       
                                const proxy:IActionized = new Proxy(comp, proxyHandler);
                                // proxy.begin(token);
                                taskInfo.pending[token] = true;
                                // log('----------- execute token start :: ' + token );
                                let returnValue:any = proxy[methodName]?.apply(proxy, Array.from(arguments));
                                // log('pending token 2 :: ' + token );
                                returnValue = (typeof returnValue === 'object' && returnValue?.then && typeof returnValue.then === 'function') ? await returnValue : returnValue;
                                taskInfo.handled[token] = true; 
                                // log('----------- execute token end :: ' + token );                               
                                resolve(returnValue);
                                progressTask.end(token, action);
                            }));
                        }
                    }
                    await Promise.all(taskPromises);
                }finally{
                    this._stopDispatching(action);
                }

            }else{
                warn('Action is dispatching. This action ' + action.type + ' is auto pushed to queue dispatching stack')
            }
        }

        /**
         * 
         * @param action 
         */
        _startDispatching(action:Action){

        }

        _stopDispatching(action:Action){
            const actionToken:number = Support.tokenize(action.type);
            delete ActionTaskDB[actionToken];
        }
        
        _invokeDispatching(){
        }
        
        
        /**
         * 
         * @param target 
         */
        async wait<TNextData = unknown>(target:string | number | Component):Promise<TNextData>{
            const actionToken:number = this._actionToken;
            if(actionToken == -1){
                DEV && warn('Do not register action token.')
                return
            }
            let waitToken:number = -1;
            switch(true){
                case js.isNumber(target):
                    waitToken = target as number;
                    break;
                case !!Actionify(target as any):
                    waitToken = (target as IActionized).token;
                    break;
                case js.isString(target):
                    waitToken = Support.tokenize(target as string); // underconstructor
                    break;
                default:
                    break;
            }
            if(waitToken == -1) error('Unknow validate \'target\' agrument pass to the \'wait\' method.');
            const taskInfo:ActionTaskInfo = ActionTaskDB[actionToken];
            if(taskInfo){                
                if(!!taskInfo.pending[waitToken]){
                    this.__detectCircleLoop(waitToken);
                }
                // log("wait token " + waitToken);
                return await AsyncWaitify(this).task(actionToken).wait(waitToken);
            }else{
                warn('Ko co trong task info !!')
            }
            // Cap nhat lai con tro actionToken vi this._actionToken co the thay doi trong qua trinh wait do co action khac xen ke
            // this._actionToken = actionToken;
            // const token:number = js.isNumber(target) ? target as number : (!!Actionify(target as any) ? (target as IActionized).token : -1);
            return 
        }

        /**
         * 
         * @param id 
         */
        protected __detectCircleLoop(token:number){
            const taskInfo:ActionTaskInfo = ActionTaskDB[this._actionToken];
            !taskInfo.handled[token] ? (DEBUG||DEV||EDITOR) ? error( this.token + ".wait(...): Phát hiện lỗi lặp vòng tròn (A đợi B, B đợi A).") : error(false) : undefined;
        }
        // ---------------- Override ----------------

        /**
         * 
         */
        public get internalOnLoad (): (() => void) | undefined {
            // 
            const actionKeys:string[] = Decoratify(this).keys('@action');
            actionKeys.forEach((key:string)=>{
                const actionInfoArr:string[] = key.split('::');
                const actionType:string = actionInfoArr[0];
                const actionToken:number = Support.tokenize(actionType);
                const methodName:string = actionInfoArr[1];
                if(!Actionized.actions.has(actionToken)) Actionized.actions.set(actionToken, new Map<number, string>());
                // const descriptor:PropertyDescriptor = js.getPropertyDescriptor(this, methodName)
                // if(typeof descriptor.value == 'function'){
                //     // const map:
                //     // if(DEV && )
                //     const invokeFunc:Function = async function (proxy:any) {                        
                //         const returnValue:any = descriptor.value.apply(proxy, Array.from(arguments));
                //         return (typeof returnValue === 'object' && returnValue?.then && typeof returnValue.then === 'function') ? await returnValue : returnValue;
                //     }
                //     // invokeFunc.constructor['actionToken'] = actionToken
                //     Actionized.actions.get(actionToken).set(this.token, invokeFunc.bind(this));
                // }
                if(Actionized.actions.get(actionToken).has(this.token)){
                    warn('There are two function handle to the same action type' + actionType);
                }else{
                    Actionized.actions.get(actionToken).set(this.token, methodName);
                }
            })
            // 
            return super['internalOnLoad']
        }

    }
    return Actionized as unknown as Constructor<TBase & IActionized>;
} )

/**
 * 
 * @param type 
 * @returns 
 */
export function action(type:string){
    const actionType:string = type;
    return function (that: any, propertyKey: string, descriptor: PropertyDescriptor) {        
        Decoratify(that).record(actionType + '::' +propertyKey.toString(), '@action');
        return descriptor;
    }
}

// export function wait(){
//     return function (that: any, propertyKey: string, descriptor: PropertyDescriptor) {        
//         // Decoratify(that).record(actionType + '::' +propertyKey.toString(), '@wait')

//         return descriptor;
//     }
// }

// export function wait()