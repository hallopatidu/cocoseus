import { Constructor, Eventify, __private, _decorator } from "cc";
import PropertyLoadify from "./core/PropertyLoadify";
import { CCEditor } from "./utils/CCEditor";
import Actionify from "./core/Actionify";

const { ccclass, property } = _decorator;

/**
 * 
 * cocoseus : cocos extendable upgrading system
 * 
 */
export namespace cocoseus {
    export const propertyDynamicLoading:  ((name?: string) => ClassDecorator) & ClassDecorator = CCEditor.makeSmartClassDecorator<string>((constructor, name) => {
        return PropertyLoadify(constructor);
    });
    
    export const eventEmitter: (() => ClassDecorator) & ClassDecorator = CCEditor.makeSmartClassDecorator((constructor:any) => {
        return Eventify(constructor);
    })

    export const actionSystem:  (() => ClassDecorator) & ClassDecorator = CCEditor.makeSmartClassDecorator<string>((constructor) => {
        return Actionify(constructor);
    });

}


