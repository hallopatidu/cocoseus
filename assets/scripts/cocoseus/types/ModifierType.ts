// export type Constructor<T> = new (...args: any[]) => T;

import { Component, Constructor, ValueType, __private } from "cc"

// ----------------------

export interface IParasitified<TSuper> {
    get super():TSuper
}

export interface IStaticParasitified<TSuper> extends Constructor<IParasitified<TSuper>> {
   
}

// ----------------------

export interface IAsyncProcessified {
    waitForReady(task?:string):Promise<any>
    execute():void
    ready(data?:any):void
}

export interface IModifierState {
    
}

export interface IInheritancified extends Component {
}

// ------------ Decoratify ---------
export interface IDecoratified extends IInheritancified {

}

export interface IStaticDecoratified extends Constructor<IDecoratified> {
    record(key:string,tag?:string):boolean
    get selectedKey():string
    keys(tag?:string):string[]
}

// ---------------- OneFlowify ---------


export interface IActionized extends IReferencified{
    dispatch(action:Action, ...receiver:string[]):void
    _startDispatching(action:Action):void
    _stopDispatching(action:Action):void
}

export interface IStaticActionized extends Constructor<IActionized>{
    
}

export interface IOneFlowified extends IInheritancified{
    dispatch(action:Action, ...receiver:string[]):void
}

export interface IStaticOneFlowified extends Constructor<IOneFlowified>{
    
}


// ------------ Referencify ------------

export interface IReferencified extends IInheritancified{
    get refInfo():ReferenceInfo;
    get token():number
}

export interface IStaticReferencified extends Constructor<IReferencified>{
   
}

// ---------------- Storagify -----------

export interface IStoragified extends IInheritancified{

}

export interface IStaticStoragified extends Constructor<IStoragified>{
    table<TData>(name:string):Map<number, TData>
}

// -------------

export type ReferenceInfo = {
    node?:string,
    comp:string,
    id:number,    
}

export type StorageObject = {
    [n:number|string]:OriginalType
}

export type OriginalType = ValueType| string | number | null | undefined | Array<OriginalType>

export type ActionObject = {
    [n:number|string]:ActionType
}
export type ActionType = object | string | number | Array<ActionObject> | Map<ActionType, ActionType> | Set<ActionType> | null | undefined;

export type Action = {
    type:string,
    sender?:string,
    receiver?:string[],
    payload?: ActionObject | ActionType,
    stores?: ActionObject | ActionType,
    // shares?: ActionObject | ActionType
}

// export type ActionInfo = {
//     type:string,
//     method:string,
//     ref:number
// }

export type Initializer = () => unknown;
export type IPropertyOptions = __private._cocos_core_data_decorators_property__IPropertyOptions;
export type PropertyType = __private._cocos_core_data_decorators_property__PropertyType;
export type LegacyPropertyDecorator = __private._cocos_core_data_decorators_utils__LegacyPropertyDecorator;
export type BabelPropertyDecoratorDescriptor = PropertyDescriptor & { initializer?: Initializer };