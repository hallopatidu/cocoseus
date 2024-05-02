import { Component, Constructor, js, warn } from "cc";
import { Action, IActionized, IReferencified, IStaticActionized } from "../types/ModifierType";
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
    generator:Generator<number>
}

class ActionTask {
    private actionToken:number

    constructor(actionToken:number){
        this.actionToken = actionToken
    }

    async invoke(){

    }

    async wait(){

    }
}

/**
 * 
 */
export default Inheritancify<IActionized, IStaticActionized>(function Actionify<TBase>(base:Constructor<TBase>):Constructor<TBase & IActionized>{
    class Actionized extends Referencify(base as unknown as Constructor<Component>) implements IActionized {
        
        private static _actions:Map<number, Map<number, Function>>;

        static get actions(){
            if(!Actionized._actions){
                Actionized._actions = Storagify(this).table<Map<number, Function>>(Actionify.name);
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
                const actionFunctions:Map<number, Function> = Actionized.actions.get(actionToken); // Map <reference token, handler function>
                // const actionKeys:number[] = [...actionFunctions.keys()];
                const taskInfo:ActionTaskInfo = {
                    pending:{},
                    handled:{},
                    action : action,
                    generator: this.generateExecutedFuntion(actionToken)
                };
                ActionTaskDB[actionToken] = taskInfo;
                // 
                this._startDispatching(action);
                try{
                    if(taskInfo && taskInfo.generator){
                        let iteratorResult:IteratorResult<number> = taskInfo.generator.next();                
                        while(iteratorResult && !iteratorResult.done){
                            const token:number = iteratorResult.value;
                            if(token !== -1){
                                const invokeFunc:Function = actionFunctions.get(token);
                                if(invokeFunc){
                                    taskInfo.pending[token] = true;
                                    invokeFunc(action);
                                    taskInfo.handled[token] = true;
                                }
                            }
                        }
                    }

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
        
        _invokeAction(token:number){
            
        }
        
        private *generateExecutedFuntion(actionToken:number):Generator<number>{
            const actionFunctions:Map<number, Function> = Actionized.actions.get(actionToken); // Map <reference token, handler function>
            const actionKeys:number[] = [...actionFunctions.keys()];
            const taskInfo:ActionTaskInfo = ActionTaskDB[actionToken]
            if(!!taskInfo){
                for (let index = 0; index < actionKeys.length; index++) {
                    const token:number = actionKeys[index];
                    if(!!taskInfo.pending[token]){
                        yield -1;
                        continue;
                    }
                    // this._invokeCallback(token);     
                    yield token
                }
            }
        }

        
        /**
         * 
         * @param target 
         */
        async wait<TNextData = unknown>(target:IActionized | string | number, actionToken:number = this._actionToken):Promise<TNextData>{
            if(actionToken == -1){
                DEV && warn('Do not register action token.')
                return
            }
            let token:number = -1;
            switch(true){
                case js.isNumber(target):
                    token = target as number;
                    break;
                case !!Actionify(target as any):
                    token = (target as IActionized).token;
                    break;
                case js.isString(target):
                    token = Support.tokenize(target as string); // underconstructor
                    break;
                default:
                    break;
            }
            const taskInfo:ActionTaskInfo = ActionTaskDB[actionToken];

            // Cap nhat lai con tro actionToken vi this._actionToken co the thay doi trong qua trinh wait do co action khac xen ke
            this._actionToken = actionToken;
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
                if(!Actionized.actions.has(actionToken)) Actionized.actions.set(actionToken, new Map<number, Function>());
                const descriptor:PropertyDescriptor = js.getPropertyDescriptor(this, methodName)
                if(typeof descriptor.value == 'function'){
                    const invokeFunc:Function = async function () {
                        this._actionToken = actionToken;
                        const returnValue:any = descriptor.value.apply(this, Array.from(arguments));
                        return (typeof returnValue === 'object' && returnValue?.then && typeof returnValue.then === 'function') ? await returnValue : returnValue;
                    }
                    Actionized.actions.get(actionToken).set(this.token, invokeFunc.bind(this));
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
        Decoratify(that).record(actionType + '::' +propertyKey.toString(), '@action')

        return descriptor;
    }
}

// export function wait()