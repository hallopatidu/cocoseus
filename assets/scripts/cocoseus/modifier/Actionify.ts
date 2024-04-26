import { Component, Constructor, js, warn } from "cc";
import { Action, IActionized, IReferencified, IStaticActionized } from "../types/ModifierType";
import { Inheritancify, hadInjectorImplemented } from "./Inheritancify";
import Storagify from "./Storagify";
import Decoratify from "./Decoratify";
import Referencify from "./Referencify";
import { Support } from "../utils/Support";


/**
 * 
 */
export default Inheritancify<IActionized, IStaticActionized>(function Actionify<TBase>(base:Constructor<TBase>):Constructor<TBase & IActionized>{
    class Actionized extends Referencify(base as unknown as Constructor<Component>) implements IActionized {
        private static _isDispatching:boolean = false;

        private static _inProgressing:{[n:number]:number[]} = Object.create(null);

        /**
         * 
         */
        static async dispatch(action:Action, ...receiver:string[]){
            const actionToken:number = Support.tokenize(action.type);
            if(!this._inProgressing[actionToken]){
                const actionStorage:Map<number, Map<number, Function>> = Storagify(this).table<Map<number, Function>>(Actionify.name);
                const actionMap:Map<number, Function> = actionStorage.get(actionToken); // Map <reference token, handler function>
                actionMap
            }else{
                warn('Action is dispatching. This action ' + action.type + ' is auto pushed to queue dispatching stack')
            }
        }

        protected _actionKey:number = -1

        private static _actions:Map<number, Map<number, Function>>;

        static get actions(){
            if(!Actionized._actions){
                Actionized._actions = Storagify(this).table<Map<number, Function>>(Actionify.name);
            }
            return Actionized._actions
        }
        
        /**
         * 
         * @param target 
         */
        async wait<TNextData = unknown>(target:IActionized | string | number):Promise<TNextData>{
            let token:number = -1;
            switch(true){
                case js.isNumber(target):
                    token = target as number;
                    break;
                case !!Actionify(target as any):
                    token = (target as IActionized).token;
                    break;
                case js.isString(target):
                    token = Support.tokenize(target as string);
                    break;
                default:
                    break;
            }
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
                    const callback:Function = async function () {
                        const returnValue:any = descriptor.value.apply(this, Array.from(arguments));
                        return (typeof returnValue === 'object' && typeof returnValue.then === 'function') ? returnValue : await returnValue;
                    }
                    Actionized.actions.get(actionToken).set(this.token, callback.bind(this));
                }
            })
            // 
            return super['internalOnLoad']
        }

    }
    return Actionized as unknown as Constructor<TBase & IActionized>;
} )


export function action(type:string){
    const actionType:string = type;
    return function (that: any, propertyKey: string, descriptor: PropertyDescriptor) {
        Decoratify(that).record(actionType + '::' +propertyKey.toString(), '@action')
        return descriptor;
    }
}