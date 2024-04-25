import { Component, Constructor } from "cc";
import { Action, ActionInfo, IActionized, IReferencified, IStaticActionized } from "../types/ModifierType";
import { Inheritancify } from "./Inheritancify";
import Storagify from "./Storagify";
import Decoratify from "./Decoratify";
import Referencify from "./Referencify";
import { Support } from "../utils/Support";


/**
 * 
 */
export default Inheritancify<IActionized, IStaticActionized>(function Actionify<TBase>(base:Constructor<TBase>):Constructor<TBase & IActionized>{
    class Actionized extends Referencify(base as unknown as Constructor<Component>) implements IReferencified {
        private static _isDispatching:boolean = false;

        private static _inProgressing:{[n:number]:number[]} = Object.create(null);

        static async dispatch(action:Action, ...receiver:string[]){
            const actionToken:number = Support.tokenize(action.type);
            if(!!this._inProgressing[actionToken]){
                const actionStorage:Map<number, Set<Function>> = Storagify(this).table<Set<Function>>(Actionify.name);
                actionStorage.get(actionToken)
            }
        }



        protected _actionKey:number = -1

        protected _actions:Map<number, Set<Function>>;



        protected get actions(){
            if(!this._actions){
                this._actions = Storagify(this).table<Set<Function>>(Actionify.name);
            }
            return this._actions
        }

        wait(comp:Component){
            
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
                const defaultPriority:number = parseInt(actionInfoArr[2]);
                const actionInfo:ActionInfo = {
                    type:actionType,
                    method:methodName,
                    ref: this.refKey
                };
                // const callback:Function = async function () {
                //     // const returnValue:any = descriptor.value.apply(this, Array.from(arguments));
                //     // return (typeof returnValue === 'object' && typeof returnValue.then === 'function') ? returnValue : await returnValue;
                // }
                
                // 
                if(!this.actions.has(actionToken)) this.actions.set(actionToken, new Set<Function>());
                this.actions.get(actionToken).add(this[methodName].bind(this));
            })
            // 
            return super['internalOnLoad']
        }

    }
    return Actionized as unknown as Constructor<TBase & IActionized>;
} )


export function action(type:string, defaultPriority:number = 0){
    const actionType:string = type;
    return function (that: any, propertyKey: string, descriptor: PropertyDescriptor) {
        Decoratify(that).record(actionType + '::' +propertyKey.toString() + '::' + defaultPriority, '@action')
        return descriptor;
    }
}