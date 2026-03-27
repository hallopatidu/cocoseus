import { _decorator,  Component, Constructor, Node, warn} from 'cc';
import { DEV } from 'cc/env';
import { cocoseus_classify } from '../definition/cocoseus.classify';
const { property } = _decorator;
const {CCClassify} = cocoseus_classify

const EventMethodMapName = Symbol();
const AddAllRegisterEvents = Symbol();
const RemoveAllRegisterEvents = Symbol();
export interface IEventHandlerClass extends Component {
    listen(node:Node):void,
    refreshEventHanders?():void,
}

/**
 * 
 */
export const EventFunctionHandlerClassName:string = "EventHandlerClass";
export default CCClassify<IEventHandlerClass>(function eventFunctionHandler<TBase=Component>(base:Constructor<TBase&IEventHandlerClass>):Constructor<TBase & IEventHandlerClass>{
    class EventHandlerClass extends (base as unknown as Constructor<IEventHandlerClass>)implements IEventHandlerClass{

        protected _eventList:Set<string> = null;

        @property({serializable:true, visible:false})
        protected _eventNode:Node = null

        protected get eventNode():Node{
            return this._eventNode ? this._eventNode  : this.node
        }

        protected set eventNode(node:Node){
            this._eventNode = node;
            this.listen && this.listen(node);
        }


        protected onLoad(): void {
            super.onLoad && super.onLoad();
            this[AddAllRegisterEvents]();
        }


        refreshEventHanders(): void {
            this[RemoveAllRegisterEvents]();
            this[AddAllRegisterEvents]();
        }


        protected onDestroy(): void {
            this[RemoveAllRegisterEvents]();
            super.onDestroy && super.onDestroy()
        }

        listen(node:Node):void {
            this._eventNode = node;
            this.refreshEventHanders && this.refreshEventHanders();
        }

        /**
         * 
         */
        [AddAllRegisterEvents](){
            if(!this.eventNode) {
                return;
            }

            if(!this._eventList){
                this._eventList = new Set<string>(this.constructor[EventMethodMapName]);
            }

            const listOfOverrideMethods:Set<string> = this.constructor[EventMethodMapName]
            listOfOverrideMethods && listOfOverrideMethods.forEach((eventAddedCommand:string)=>{
                const commands:string[] = eventAddedCommand.split('::');
                const eventName:string = commands[1];
                const methodName:string = commands[2];
                const targetMethod:Function = this[methodName];
                if(targetMethod && typeof targetMethod == 'function'){
                    this.eventNode[commands[0]](eventName, targetMethod, this);
                }else{
                    DEV && warn('EventFunctionHandler :: internalOnLoad :: ' + methodName + ' is not a function', this.name, this[methodName]?.name);
                }
            })
        }

        /**
         * 
         */
        [RemoveAllRegisterEvents](){
            if(!this.eventNode || !(this._eventList && this._eventList.size)) {
                return;
            }
            const listOfOverrideMethods:Set<string> = this._eventList;
            listOfOverrideMethods && listOfOverrideMethods.forEach((eventAddedCommand:string)=>{
                const commands:string[] = eventAddedCommand.split('::');
                const command:string = commands[0];
                const eventName:string = commands[1];
                const methodName:string = commands[2];
                const targetMethod:Function = this[methodName];
                // 
                if(command == 'on' && targetMethod && typeof targetMethod == 'function'){
                    this.eventNode?.off(eventName, targetMethod, this);
                }else{
                    console.warn('EventFunctionHandler :: internalOnLoad :: ' + methodName + ' is not a function', this.name, this[methodName].name);
                }
            })
            listOfOverrideMethods.clear();
        }

    }

    return EventHandlerClass as unknown as Constructor<TBase & IEventHandlerClass>;
}, EventFunctionHandlerClassName)

/**
 * *Decorator*
 * Usage is similar to @property but only for methods.
 * Example of catching the "CUSTOM_EVENT" event on a node with a component:
 * @onEvent
 * onCustomEvent(evt:Event){
 *      // Event Name: 'on' + upercase(Custom) + "_" + upercase(Event)
 * }
 * 
 * @onEvent('CUSTOM_EVENT')
 * onCustomEvent(evt:Event){
 *      // Event Name: 'CUSTOM_EVENT'
 * }
 * 
 * @param target 
 * @param propertyKey 
 * @param descriptor 
 */
export function onEvent (options?: string):any;
export function onEvent(target: any, propertyKey?: string, descriptor?: PropertyDescriptor): any | void {
    let eventName: string | null = null;
    function normalized (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {
        if (DEV) {
            debug: descriptor;
        }
        let listOfOverrideMethods: Set<string> = target.constructor[EventMethodMapName];
        if (!listOfOverrideMethods) {
            // target is a intializer of class. So, you should save EventMethodMapName to constructor as a static properties
            listOfOverrideMethods = target.constructor[EventMethodMapName] = new Set<string>();
        }
        if(!eventName) {
            eventName = methodNameToEventName(propertyKey); 
        };
        const signalRecord:string = 'on::' +(eventName || '') + '::' + propertyKey
        if (!listOfOverrideMethods.has(signalRecord)) {
            listOfOverrideMethods.add(signalRecord);
        }
    }

    if (target === undefined) {
        return onEvent();
    } else if (typeof propertyKey === 'undefined') {
        eventName = target as string;
        return normalized;
    } else {
        // @on
        normalized(target, propertyKey, descriptor);
        return undefined;
    }
}

/**
 * *Decorator*
 * Using with @onceEvent, this decorator just use for method function to inherit the Component Instance's method.
 * @param target 
 * @param propertyKey 
 * @param descriptor 
 */
export function onceEvent (options?: string):any;
export function onceEvent (target: any, propertyKey?: string, descriptor?: PropertyDescriptor): any | void {
    let eventName: string | null = null;
    function normalized (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {
        if (DEV) {
            debug: descriptor;
        }
        let listOfOverrideMethods: Set<string> = target[EventMethodMapName];
        if (!listOfOverrideMethods) {
            listOfOverrideMethods = target[EventMethodMapName] = new Set<string>();
        }
        if(!eventName) {
            eventName = methodNameToEventName(propertyKey); 
        };
        const commandRecord:string = 'once::' +(eventName || '') + '::' + propertyKey
        if (!listOfOverrideMethods.has(commandRecord)) {
            listOfOverrideMethods.add(commandRecord);
        }
    }

    if (target === undefined) {
        return onceEvent();
    } else if (typeof propertyKey === 'undefined') {
        eventName = target as string;
        return normalized;
    } else {
        // @on
        normalized(target, propertyKey, descriptor);
        return undefined;
    }
}


/**
 * 
 * @param methodName 
 * @returns 
 */
function methodNameToEventName(methodName:string) {
    return methodName.replace(/^on/, '') // Xóa tiền tố "on"
        .replace(/([a-z])([A-Z])/g, '$1_$2') // Thêm dấu "_" giữa chữ thường và chữ hoa
        .toUpperCase(); // Chuyển thành chữ hoa hoàn toàn
}