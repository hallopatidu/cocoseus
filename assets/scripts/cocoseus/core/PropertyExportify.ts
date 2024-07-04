import { _decorator, CCObject, Component, Constructor, js, Node } from 'cc';
import { CCClassify, Inheritancify } from './Inheritancify';
import Decoratify from './Decoratify';
import { IPropertyExportified, IPropertyOptions, IStaticPropertyExportified, PropertyStash } from '../types/CoreType';
const { ccclass, property } = _decorator;

export const PropertyExportifyInjector:string = "PropertyExportify";
export const PropertyExportifyDecorator:string = "@property.export";

export default CCClassify<IPropertyExportified, IStaticPropertyExportified>(function PropertyExportify<TBase>(base:Constructor<TBase>):Constructor<TBase & IPropertyExportified>{
    class PropertyExportified extends Decoratify (base as unknown as Constructor<Component>) {

        
    }
    return PropertyExportified as unknown as Constructor<TBase & IPropertyExportified>;
})

/**
 * 
 * @param constructor 
 * @param propertyName 
 * @param properties 
 */
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
