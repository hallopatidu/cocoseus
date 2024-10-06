import { _decorator, CCObject, Component, Constructor, js } from 'cc';
import { CCClassify, remakePropertyDecorator } from './Inheritancify';
import Decoratify from './Decoratify';
import { ClassStash, IPropertyExportified, IStaticPropertyExportified, PropertyStash } from '../types/CoreType';
const { ccclass, property } = _decorator;

export const PropertyExportifyInjector:string = "PropertyExportify";
// export const PropertyExportifyDecorator:string = "@property.export";

export default CCClassify<IPropertyExportified, IStaticPropertyExportified>(function PropertyExportify<TBase>(base:Constructor<TBase>):Constructor<TBase & IPropertyExportified>{
    class PropertyExportified extends Decoratify (base as unknown as Constructor<Component>) {}
    remakePropertyDecorator(base, 'property', exportifiedPropertyDecorator);
    return PropertyExportified as unknown as Constructor<TBase & IPropertyExportified>;
}, PropertyExportifyInjector)

/**
 * 
 * @param constructor 
 * @param propertyName 
 * @param properties 
 */
function exportifiedPropertyDecorator(classStash:ClassStash, propertyStash:PropertyStash, ctor:Constructor, propertyKey:string){
    const isTypeArray:boolean = propertyStash.type && Array.isArray(propertyStash.type);
    let classType:CCObject = isTypeArray ? propertyStash.type[0] : propertyStash.type;
    // const classTypeName:string = js.getClassName(classType);
    // const recordContent:string = propertyKey.toString() + (classTypeName ? "::" + classTypeName : "");
    // Decoratify({constructor:ctor}).record(recordContent, PropertyExportifyDecorator);
}

// function remakeProperty(constructor:Constructor, propertyName:string, properties:any){
//     const options:IPropertyOptions = properties[propertyName];
//     // Do not support Class Array Type.
//     const isTypeArray:boolean = options.type && Array.isArray(options.type);
//     let classType:CCObject = isTypeArray ? options.type[0] : options.type;
//     // 
//     const classTypeName:string = js.getClassName(classType);
//     const recordContent:string = propertyName + (classTypeName ? "::" + classTypeName : "");
//     Decoratify({constructor}).record(recordContent, PropertyLoadifiedDecorator);
// }
