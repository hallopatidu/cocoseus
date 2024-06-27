import { _decorator, CCObject, Component, Constructor, js, Node } from 'cc';
import { Inheritancify } from './Inheritancify';
import Decoratify from './Decoratify';
import { CACHE_KEY } from '../utils/CCEditor';
import { IPropertyOptions, PropertyStash } from '../types/CoreType';
const { ccclass, property } = _decorator;

export const PropertyLoadifiedInjector:string = "PropertyExportify";
export const PropertyLoadifiedDecorator:string = "@property.export";

export default Inheritancify(function PropertyExportify <TBase>(base:Constructor<TBase>):Constructor<TBase>{

    class PropertyExportied extends Decoratify (base as unknown as Constructor<Component>) {

        
    }

    // Apply to all @property decorator.
    const cache = base[CACHE_KEY];    
    if (cache) {
        const decoratedProto = cache.proto;
        if (decoratedProto) {
            const properties:Record<string, any> = decoratedProto.properties;
            // 
            PropertyExportied[CACHE_KEY] = js.createMap();
            const classStash:unknown = PropertyExportied[CACHE_KEY] || ((PropertyExportied[CACHE_KEY]) ??= {});
            const ccclassProto:unknown = classStash['proto'] || ((classStash['proto'])??={});
            const injectorProperties:unknown = ccclassProto['properties'] || ((ccclassProto['properties'])??={});
            // 
            const keys:string[] = Object.keys(properties);
            keys.forEach((propertyName:string)=>{
                const propertyStash:PropertyStash = injectorProperties[propertyName] ??= {};
                js.mixin(propertyStash, properties[propertyName])
                remakeProperty(PropertyExportied, propertyName, injectorProperties);
            })            
        }
        base[CACHE_KEY] = undefined;
    }

    return
})

/**
 * 
 * @param constructor 
 * @param propertyName 
 * @param properties 
 */
function remakeProperty(constructor:Constructor, propertyName:string, properties:any){
    const options:IPropertyOptions = properties[propertyName];
    // Do not support Class Array Type.
    const isTypeArray:boolean = options.type && Array.isArray(options.type);
    let classType:CCObject = isTypeArray ? options.type[0] : options.type;
    // 
    const classTypeName:string = js.getClassName(classType);
    const recordContent:string = propertyName + (classTypeName ? "::" + classTypeName : "");
    Decoratify({constructor}).record(recordContent, PropertyLoadifiedDecorator);
}
