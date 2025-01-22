import { Constructor, Eventify, __private, _decorator, js } from "cc";
import PropertyLoadify, { PropertyLoadifyInjector } from "./core/PropertyLoadify";
import { CCEditor } from "./utils/CCEditor";
// import Actionify, { ActionifyInjector } from "./core/Actionify";
import PropertyExportify, { PropertyExportifyInjector } from "./core/PropertyExportify";
import { ParasitifyInjector } from "./core/Parasitify";

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
        Parasitify: ParasitifyInjector
        // ActionSystem: ActionifyInjector,
    }
    
    export const propertyDynamicLoading:  ((url?:string,version?:string) => ClassDecorator) & ClassDecorator = CCEditor.makeSmartClassDecorator<string>((constructor, url?:string, version?:string) => {
        url && console.log('url:: ' + url);
        version && console.log('version:: ' + version);
        return PropertyLoadify(constructor,url, version);
    });
    
    // export const eventEmitter: (() => ClassDecorator) & ClassDecorator = CCEditor.makeSmartClassDecorator((constructor:any) => {
        
    //     return Eventify(constructor);
    // })

    // export const actionSystem:  (() => ClassDecorator) & ClassDecorator = CCEditor.makeSmartClassDecorator<string>((constructor) => {
    //     return Actionify(constructor);
    // });


    export const exportProperties: (() => ClassDecorator) & ClassDecorator = CCEditor.makeSmartClassDecorator<string>((constructor) => {
        return PropertyExportify(constructor);
    });


}


