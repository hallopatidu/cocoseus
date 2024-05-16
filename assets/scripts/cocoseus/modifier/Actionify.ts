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
    graph:{[n:number]:number[]},
    progress?:IAsyncProcessified
    action:Action
}



/**
 * 
 */
export default Inheritancify<IActionized, IStaticActionized>(function Actionify<TBase>(base:Constructor<TBase>):Constructor<TBase & IActionized>{
    class Actionized extends Referencify(AsyncWaitify(base as unknown as Constructor<Component>)) implements IActionized, IAsyncWaited {
        
        private static _actions:Map<number, Map<number, Function[]>>;

        static get actions(){
            if(!Actionized._actions){
                Actionized._actions = Storagify(this).table<Map<number, Function[]>>(Actionify.name);
            }
            return Actionized._actions
        }

        protected _actionToken:number = -1;
        
        /**
         * 
         * @param action 
         * @param receiver 
         */
        async dispatch(action:Action, ...receiver:(string | number | Component)[]){
            // 
            const actionToken:number = Support.tokenize(action.type);
            const actionFunctions:Map<number, Function[]> = Actionized.actions.get(actionToken); // Map <reference token, handler function>
            if(!actionFunctions){
                DEV && warn('The action \"' + action.type + '\" was not registed !');
                return;
            }
            if(!ActionTaskDB[actionToken]){
                const taskInfo:ActionTaskInfo = {
                    graph:{},
                    action : action                                
                };
                ActionTaskDB[actionToken] = taskInfo;
                // 
                const receiverTokens:number[] = receiver.map(receiverToken => this.getTokenFrom(receiverToken))
                // 
                this._startDispatching(action);
                try{
                    const taskPromises:Promise<any>[] = [];                    
                    const actionKeys:number[] = [...actionFunctions.keys()];
                    const progressTask:IAsyncProcessified = AsyncWaitify(this).task(actionToken); 
                    taskInfo.progress = progressTask;
                    // 
                    actionKeys.forEach((token:number)=> !(receiver && receiver.length && receiverTokens.indexOf(token) == -1) && progressTask.begin(token));
                    // 
                    for (let index = 0; index < actionKeys.length; index++) {
                        const token:number = actionKeys[index];
                        if(!(receiver && receiver.length && receiverTokens.indexOf(token) == -1)){
                            const functionalInvokers:Function[] = actionFunctions.get(token);
                            functionalInvokers && taskPromises.push(Promise.all(functionalInvokers.map(invoker=>invoker(taskInfo))));
                        }
                    }
                    await Promise.all(taskPromises);
                }finally{
                    this._stopDispatching(action);
                }

            }else{
                warn('Action ' + action.type + ' is still dispatching. This action ' + action.type + ' is auto pushed to queue dispatching stack')

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
            if(!target) return null
            const actionToken:number = this._actionToken;
            if(actionToken == -1){
                DEV && warn('Do not register action token.')
                return
            }
            // 
            const waitToken:number = this.getTokenFrom(target);
            if(waitToken == -1) error('Unknow validate \'target\' agrument pass to the \'wait\' method.');
            // 
            const taskInfo:ActionTaskInfo = ActionTaskDB[actionToken];
            if(taskInfo){
                const graph:number[] = taskInfo.graph[this.token] ??= [];
                if(graph.indexOf(waitToken) == -1){
                    graph.push(waitToken);
                    const cyclicLoops:(string|number)[] = this.__detectCircleLoop(taskInfo.graph);
                    if((DEBUG||DEV||EDITOR) && !!cyclicLoops ){  
                        error( 'At ' + Referencify(this).getRefPath(this.token) + ".wait( "+Referencify(this).getRefPath(waitToken) +" ): Detect cyclic loop error (A wait B, B wait A). " );
                        const cycleList:string[] = cyclicLoops?.map(eachToken=>Referencify(this).getRefPath(eachToken as number));
                        error('Cyclic detail :: ' + cycleList.join(' => ') + ' .\n Cyclic Token List: ' + cyclicLoops?.join(' => '));
                    }
                    return await AsyncWaitify(this).task(actionToken).wait<TNextData>(waitToken);
                }else{
                    DEV && error('Error at ' + Referencify(this).getRefPath(this.token) + '.wait(' + Referencify(this).getRefPath(waitToken) + '). Each component just wait one other component on one time dispatching !')
                }
            }else{
                warn('This funtion is not run on a action progress.')
            }
            return null;
        }

        /**
         * 
         * @param target 
         * @returns 
         */
        protected getTokenFrom(target:string | number | Component){
            let waitToken:number = -1;
            switch(true){
                case js.isNumber(target):
                    if(Referencify(this).validToken(target as number) ){
                        waitToken = target as number;
                    }else if(DEV){
                        error('The token is invalid')
                    }
                    break;
                
                case js.isString(target):
                    // waitToken = Support.tokenize(target as string); // underconstructor
                    waitToken = Referencify(this).findToken(target as string);
                    if(DEV && waitToken == -1) {error('Can\'t find the token map with ' + target.toString())}
                    break;

                case !!Actionify(target as any):
                    waitToken = (target as IActionized).token;
                    break;

                default:
                    break;
            }
            return waitToken;
        }

        /**
         * Detect Cycle in a Directed Graph Data. BFS solution (Bread First Search);
         * A BFS solution that will find one cycle (if there are any), which will be (one of) the shortest.
         * @param id 
         */
        protected __detectCircleLoop(graph:{[n:number]:number[]}){
            let queue = Object.keys(graph).map( key => [key.toString()] );
            while (queue.length) {
                const batch = [];
                for (const path of queue) {
                    const parents = graph[parseInt(path[0])] || [];
                    for (const key of parents) {
                        const repaths:number[] = path.map(key=>parseInt(key))
                        if (key === parseInt(path[path.length-1])) return [key, ...repaths];
                        batch.push([key, ...repaths]);
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
                if(!Actionized.actions.has(actionToken)) Actionized.actions.set(actionToken, new Map<number, Function[]>());
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
                const currentToken:number = this.token;
                // Use a proxy with proxyHandler to ensure this._actionToken does not change when calling multiple actions at the same time.  
                // This like use flyweight design pattern
                const proxy:IActionized = new Proxy(this, proxyHandler);
                const functionalInvoker:Function = function(taskInfo:ActionTaskInfo):Promise<any>{        
                    const progressTask:IAsyncProcessified = taskInfo.progress;
                    const action:Action = taskInfo.action;
                    const functionName:string = methodName;
                    const compProxy:IActionized = proxy;
                    return new Promise(async (resolve:Function)=>{
                        // Invoke funtion
                        let returnValue:any = compProxy[functionName]?.apply(compProxy, Array.from(arguments));
                        // 
                        returnValue = (typeof returnValue === 'object' && returnValue?.then && typeof returnValue.then === 'function') ? await returnValue : returnValue;
                        // 
                        resolve(returnValue);
                        progressTask.end(currentToken, action);
                        // 
                    })
                };
                // Record invoker function via mapping with token.
                let functionalInvokers:Function[] = Actionized.actions.get(actionToken).get(this.token);
                if(!functionalInvokers){
                    functionalInvokers = [functionalInvoker];                    
                }else{
                    functionalInvokers.push(functionalInvoker)
                }
                Actionized.actions.get(actionToken).set(this.token, functionalInvokers);
            })
            // 
            return super['internalOnLoad']
        }

        /**
         * 
         */
        public get internalOnDisable (): (() => void) | undefined {
            const actionKeys:string[] = Decoratify(this).keys('@action');
            actionKeys.forEach((key:string)=>{
                const actionInfoArr:string[] = key.split('::');
                const actionType:string = actionInfoArr[0];
                const actionToken:number = Support.tokenize(actionType);                
                if(Actionized.actions.get(actionToken).has(this.token)){
                    Actionized.actions.get(actionToken).delete(this.token);
                }
            })
            return super['internalOnDisable']
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
