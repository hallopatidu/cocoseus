import { Component, Constructor, error, find, js, log, warn } from "cc";
import { Action, IActionized, IAsyncProcessified, IAsyncWaited, IStaticActionized, ReferenceInfo } from "../types/ModifierType";
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
    graph:{[n:number]:number[]},
    progress?:IAsyncProcessified
    action:Action
}



/**
 * 
 */
export default Inheritancify<IActionized, IStaticActionized>(function Actionify<TBase>(base:Constructor<TBase>):Constructor<TBase & IActionized>{
    class Actionized extends Referencify(AsyncWaitify(base as unknown as Constructor<Component>)) implements IActionized, IAsyncWaited {
        
        private static _actions:Map<number, Map<number, Function>>;

        static get actions(){
            if(!Actionized._actions){
                Actionized._actions = Storagify(this).table<Map<number, Function>>(Actionify.name);
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
            const actionFunctions:Map<number, Function> = Actionized.actions.get(actionToken); // Map <reference token, handler function>
            if(!actionFunctions){
                DEV && warn('The action \"' + action.type + '\" was not registed !');
                return;
            }
            if(!ActionTaskDB[actionToken]){
                const taskInfo:ActionTaskInfo = {
                    pending:{}, // Dang xu ly goi vao day.
                    handled:{}, // action nao xong goi vao day.
                    graph:{},
                    action : action                                
                };
                ActionTaskDB[actionToken] = taskInfo;
                // 
                this._startDispatching(action);
                try{
                    const taskPromises:Promise<any>[] = [];                    
                    const actionKeys:number[] = [...actionFunctions.keys()];
                    const progressTask:IAsyncProcessified = AsyncWaitify(this).task(actionToken);
                    taskInfo.progress = progressTask;
                    // 
                    actionKeys.forEach((token:number)=>{
                        progressTask.begin(token);
                    });
                    // 
                    for (let index = 0; index < actionKeys.length; index++) {
                        const token:number = actionKeys[index];
                        // progressTask.begin(token);
                        const funtionalInvoker:Function = actionFunctions.get(token);
                        taskPromises.push(funtionalInvoker(taskInfo));
                    }
                    await Promise.all(taskPromises);
                }finally{
                    this._stopDispatching(action);
                }

            }else{
                warn('Action ' + action.type + ' is dispatching. This action ' + action.type + ' is auto pushed to queue dispatching stack')
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
        
        _invokeDispatching(token:number):any{
            const actionToken:number = this._actionToken;            
            return
        }
        
        
        /**
         * 
         * @param target 
         */
        async wait<TNextData = unknown>(target:string | number | Component):Promise<TNextData>{
            if(!target) return
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
                const graph:number[] = taskInfo.graph[this.token] ??= [];
                if(graph.indexOf(waitToken) == -1){
                    graph.push(waitToken);
                    const cycleLoops:(string|number)[] = this.__detectCircleLoop(taskInfo.graph);
                    if((DEBUG||DEV||EDITOR) && !!cycleLoops ){  
                        error( 'At ' + Referencify(this).getRefPath(this.token) + ".wait( "+Referencify(this).getRefPath(waitToken) +" ): Phát hiện lỗi lặp vòng tròn (A đợi B, B đợi A). " );
                        const cycleList:string[] = [];
                        cycleLoops.forEach((eachToken:number)=>{
                            const refInfo:ReferenceInfo = Referencify(this).getRefInfo(eachToken)
                            refInfo && cycleList.push(refInfo?.comp + '<' + refInfo?.node );
                        }, [])
                        error(' Cyclic detail :: ' + cycleList?.join(' => ') + ' .\n Token: ' + cycleLoops?.join(' => '));
                    }
                    return await AsyncWaitify(this).task(actionToken).wait<TNextData>(waitToken);
                }else{
                    DEV && error('Error at ' + Referencify(this).getRefPath(this.token) + '.wait(' + Referencify(this).getRefPath(waitToken) + '). Each component just wait one other component on one time !')
                }
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
        protected __detectCircleLoop(graph:{[n:number]:number[]}){
            let queue = Object.keys(graph).map( key => [key.toString()] );
            while (queue.length) {
                const batch = [];
                for (const path of queue) {
                    const parents = graph[parseInt(path[0])] || [];
                    for (const key of parents) {
                        if (key === parseInt(path[path.length-1])) return [key, ...path.map(key=>parseInt(key))];
                        batch.push([key, ...path.map(key=>parseInt(key))]);
                    }
                }
                queue = batch;
            }
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
                // 
                // Registration of this Component to the dispatcher system.
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
                // 
                const token:number = this.token;
                const proxy:IActionized = new Proxy(this, proxyHandler);
                const funtionalInvoker:Function = function(taskInfo:ActionTaskInfo):Promise<any>{        
                    const progressTask:IAsyncProcessified = taskInfo.progress;
                    const action:Action = taskInfo.action;
                    const funtionName:string = methodName;
                    const compProxy:IActionized = proxy;
                    return new Promise(async (resolve:Function)=>{
                        // Sử dụng proxy với proxyHandler để đảm bảo this._actionToken không thay đổi khi gọi cùng lúc nhiều action                        
                        taskInfo.pending[token] = true;
                        // Call funtion
                        let returnValue:any = compProxy[funtionName]?.apply(compProxy, Array.from(arguments));
                        // 
                        returnValue = (typeof returnValue === 'object' && returnValue?.then && typeof returnValue.then === 'function') ? await returnValue : returnValue;
                        taskInfo.handled[token] = true;                        
                        resolve(returnValue);
                        progressTask.end(token, action);
                        // 
                    })
                };
                // Record callback to the handler funtion map to token.
                if(Actionized.actions.get(actionToken).has(this.token)){
                    warn('There are two function handle to the same action type' + actionType);
                }else{
                    Actionized.actions.get(actionToken).set(this.token, funtionalInvoker);
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