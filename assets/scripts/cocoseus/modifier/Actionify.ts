import { Component, Constructor, error, find, js, log, warn } from "cc";
import { Action, IActionized, IReferencified, IStaticActionized, ReferenceInfo } from "../types/ModifierType";
import { Inheritancify, hadInjectorImplemented } from "./Inheritancify";
import Storagify from "./Storagify";
import Decoratify from "./Decoratify";
import Referencify from "./Referencify";
import { Support } from "../utils/Support";
import { DEV } from "cc/env";


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
    class Actionized extends Referencify(base as unknown as Constructor<Component>) implements IActionized {
        
        private static _actions:Map<number, Map<number, string>>;

        static get actions(){
            if(!Actionized._actions){
                Actionized._actions = Storagify(this).table<Map<number, string>>(Actionify.name);
            }
            return Actionized._actions
        }

        protected _actionToken:number = -1
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
                    pending:{},
                    handled:{},
                    action : action        
                                
                };
                // taskInfo.generator = this.generateExecutedFuntion(actionToken, taskInfo);
                // 
                const proxyHandler = {
                    get(target, prop) {                        
                        target._actionToken = actionToken;
                        log('call  -prop: ' + prop.toString());
                        return Reflect.get(target, prop, receiver);
                        
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
                    // this._invokeDispatching(actionToken)
                    // const actionFunctions:Map<number, string> = Actionized.actions.get(actionToken); // Map <reference token, handler function>
                    // const actionKeys:number[] = [...actionFunctions.keys()];
                    // for (let index = 0; index < actionKeys.length; index++) {
                    //     const token:number = actionKeys[index];
                    //     const methodName:string = actionFunctions.get(token);
                    //     const comp:(TBase & IActionized) = Referencify(this).getComponent(token);
                    //     if(comp){
                    //         (new Proxy(comp, proxyHandler))[methodName](action);
                    //     }
                    // }
                    // if(taskInfo && taskInfo.generator){                        
                    //     let iteratorResult:IteratorResult<Function> = taskInfo.generator.next();       
                    //     while(iteratorResult && !iteratorResult.done){
                    //         const invokeFunc:Function = iteratorResult.value;
                    //         if(invokeFunc){
                    //             if(invokeFunc){
                    //                 // taskInfo.pending[token] = true;
                    //                 invokeFunc(action)
                    //                 // taskInfo.handled[token] = true;
                    //             }
                    //         }
                    //         iteratorResult = taskInfo.generator.next();
                    //     }
                    // }

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
            // const actionToken:number = Support.tokenize(action.type);
            // const taskInfo:ActionTaskInfo = ActionTaskDB[actionToken];
            // if(taskInfo && taskInfo.generator){
            //     let iteratorResult:IteratorResult<Function> = taskInfo.generator.next();                
            //     while(iteratorResult && !iteratorResult.done && iteratorResult.value){
            //         const invokeFunc:Function = iteratorResult.value;
            //         invokeFunc && invokeFunc(action);
            //     }
            // }
        }

        _stopDispatching(action:Action){
            // const actionToken:number = Support.tokenize(action.type);
            // const taskInfo:ActionTaskInfo = ActionTaskDB[actionToken]
            // if(taskInfo && taskInfo.generator){
            //     const invokeFunc:Function = taskInfo.generator.next().done
            // }
        }
        
        _invokeDispatching(){
            // if(taskInfo && taskInfo.generator){
            //     let iteratorResult:IteratorResult<number> = taskInfo.generator.next();                
            //     while(iteratorResult && !iteratorResult.done){
            //         const token:number = iteratorResult.value;
            //         if(token !== -1){
            //             const invokeFunc:Function = actionFunctions.get(token);
            //             if(invokeFunc){
            //                 taskInfo.pending[token] = true;
            //                 invokeFunc(action);
            //                 taskInfo.handled[token] = true;
            //             }
            //         }
            //     }
            // }
        }
        
        // private *generateExecutedFuntion(actionToken:number, taskInfo:ActionTaskInfo):Generator<Function>{
        //     const actionFunctions:Map<number, string> = Actionized.actions.get(actionToken); // Map <reference token, handler function>
        //     const actionKeys:number[] = [...actionFunctions.keys()];
        //     const proxyHandler = {
        //         get(target, prop) {                        
        //             target._actionToken = actionToken;
        //             log('call  -prop: ' + prop.toString())
        //             return Reflect.get(target, prop);
                    
        //         },
        //         set(target, prop, value) {
        //             target._actionToken = actionToken;                       
        //             return Reflect.set(target, prop, value);
        //         },
        //     }
        //     if(!!taskInfo){
        //         for (let index = 0; index < actionKeys.length; index++) {
        //             const token:number = actionKeys[index];
        //             if(!!taskInfo.pending[token]){
        //                 yield null;
        //                 continue;
        //             }
        //             const methodName:string = actionFunctions.get(token);
        //             const comp:(TBase & IActionized) = Referencify(this).getComponent(token);
        //             if(comp){
        //                 yield (new Proxy(comp, proxyHandler))[methodName]
        //             }                    
        //         }
        //     }
        // }

        
        /**
         * 
         * @param target 
         */
        async wait<TNextData = unknown>(target:IActionized | string | number):Promise<TNextData>{
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
            // const taskInfo:ActionTaskInfo = ActionTaskDB[actionToken];

            // Cap nhat lai con tro actionToken vi this._actionToken co the thay doi trong qua trinh wait do co action khac xen ke
            // this._actionToken = actionToken;
            // const token:number = js.isNumber(target) ? target as number : (!!Actionify(target as any) ? (target as IActionized).token : -1);
            return 
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