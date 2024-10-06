import { Constructor, Eventify, __private, _decorator, js } from "cc";
import PropertyLoadify, { PropertyLoadifyInjector } from "./core/PropertyLoadify";
import { CCEditor } from "./utils/CCEditor";
import Actionify, { ActionifyInjector } from "./core/Actionify";
import PropertyExportify, { PropertyExportifyInjector } from "./core/PropertyExportify";

const { ccclass, property } = _decorator;

/**
 * 
 * cocoseus : cocos extendable upgrading system
 * 
 */

export namespace cocoseus {
    export const Plugin = {
        ExportProperties: PropertyExportifyInjector,
        DynamicLoading: PropertyLoadifyInjector,
        ActionSystem: ActionifyInjector,
    }
    
    export const propertyDynamicLoading:  ((url?:string) => ClassDecorator) & ClassDecorator = CCEditor.makeSmartClassDecorator<string>((constructor, url?:string) => {
        url && console.log('url:: ' + url);
        return PropertyLoadify(constructor,url);
    });
    
    // export const eventEmitter: (() => ClassDecorator) & ClassDecorator = CCEditor.makeSmartClassDecorator((constructor:any) => {
        
    //     return Eventify(constructor);
    // })

    export const actionSystem:  (() => ClassDecorator) & ClassDecorator = CCEditor.makeSmartClassDecorator<string>((constructor) => {
        return Actionify(constructor);
    });


    export const exportProperties: (() => ClassDecorator) & ClassDecorator = CCEditor.makeSmartClassDecorator<string>((constructor) => {
        return PropertyExportify(constructor);
    });


}


