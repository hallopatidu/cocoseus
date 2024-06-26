// export type Constructor<T> = new (...args: any[]) => T;

import { Asset, Component, Constructor, ValueType, __private } from "cc"


// TYPE
export type EmbedAsset = Asset|Node|Component

// --------------- Parasitify --------

export interface IParasitified<TSuper> {
    get super():TSuper
    get host():TSuper
}

export interface IStaticParasitified<TSuper> extends Constructor<IParasitified<TSuper>> {
   
}

// -------------- Interfacify --------
export interface IInterfacified extends Component {
    
}

export interface IStaticInterfacified extends Constructor<IInterfacified> {
    
}

// -------------- AsyncProcessify --------

export interface IAsyncProcessified {
    wait<TNextData = unknown>(token?:number):Promise<TNextData>
    begin(token?:number):void
    end(token?:number, data?:any):void
    isProgressing(token?:number):boolean
}

export interface IModifierState {
    
}

// ------------ Inheritancify -------------

export interface IInheritancified extends Component {
}

// ------------ Decoratify ---------
export interface IDecoratified extends IInheritancified {

}

export interface IStaticDecoratified extends Constructor<IDecoratified> {
    record(key:string,tag?:string):boolean
    remove(key:string, tag:string):boolean
    keys(tag?:string):string[]
}

// ------------ Actionify ---------


export interface IActionized extends IReferencified{
    dispatch(action:Action, ...receiver:(string | number | Component)[]):void
    wait<TNextData = unknown>(target:string | number | Component):Promise<TNextData>
    _startDispatching(action:Action):void
    _stopDispatching(action:Action):void
}

export interface IStaticActionized extends Constructor<IActionized>{
    
}

// ------------ AsyncWaitify ---------
export interface IAsyncWaited extends IStoragified {
    
}

export interface IStaticAsyncWaited extends Constructor<IAsyncWaited>{
    task(token:number):IAsyncProcessified
}

// ---------------------------
// export interface IOneFlowified extends IInheritancified{
//     dispatch(action:Action, ...receiver:string[]):void
// }

// export interface IStaticOneFlowified extends Constructor<IOneFlowified>{
    
// }


// ------------ LazyLoadify ------------
export interface IPropertyLoadified extends IInheritancified{
    analysisAsset<T=EmbedAsset>(propertyName:string, asset:T):Promise<SimpleAssetInfo>;
    onLoadedAsset(propertyName:string, asset:SimpleAssetInfo):void;
    onEditorAssetChanged(propertyName:string):void;
}

export interface IStaticPropertyLoadified extends Constructor<IPropertyLoadified>{

}
// ------------ Referencify ------------

export interface IReferencified extends IInheritancified{
    get refInfo():ReferenceInfo;
    get token():number;
    // analysisAsset<T=EmbedAsset>(propertyName:string, asset:T):Promise<SimpleAssetInfo>
    // onLoadedAsset(propertyName:string, asset:SimpleAssetInfo)
}

export interface IStaticReferencified extends Constructor<IReferencified>{
    getRefInfo(token:number):ReferenceInfo;
    getRefPath(token:number):string;
    getComponent<T>(token:number):T;
    validToken(token:number):boolean;
    findToken(searchValue:string):number;
    genToken(info:ReferenceInfo):number
}

// __private._cocos_core_event_eventify__IEventified

// ---------------- Storagify -----------

export interface IStoragified extends IInheritancified{

}

export interface IStaticStoragified extends Constructor<IStoragified>{
    table<TData>(name:string):Map<number, TData>
}

// -------------

export type SimpleAssetInfo = {
    name?:string,
    type?:string,
    uuid?: string;
    url?: string;
    bundle?: string    
}

export type PrefabInfo = SimpleAssetInfo & {
    references?:ReferenceInfo[]
}

export type ReferenceInfo = {
    root?:string,
    node?:string,
    property?:string,
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
export type PrimitiveType<T> = __private._cocos_core_data_utils_attribute__PrimitiveType<T>;
export type IExposedAttributes = __private._cocos_core_data_utils_attribute_defines__IExposedAttributes;
export type PropertyStash = IExposedAttributes & {
    default?: unknown;
    get?: () => unknown;
    set?: (value: unknown) => void;
    _short?: unknown;
    __internalFlags: number;
}
export type IPropertyOptions = __private._cocos_core_data_decorators_property__IPropertyOptions;
export type PropertyType = __private._cocos_core_data_decorators_property__PropertyType;
export type LegacyPropertyDecorator = __private._cocos_core_data_decorators_utils__LegacyPropertyDecorator;
export type BabelPropertyDecoratorDescriptor = PropertyDescriptor & { initializer?: Initializer };
export enum PropertyStashInternalFlag {
    /**
     * Indicates this property is reflected using "standalone property decorators" such as
     * `@editable`, `@visible`, `serializable`.
     * All standalone property decorators would set this flag;
     * non-standalone property decorators won't set this flag.
     */
    STANDALONE = 1 << 0,

    /**
     * Indicates this property is visible, if no other explicit visibility decorators(`@visible`s) are attached.
     */
    IMPLICIT_VISIBLE = 1 << 1,

    /**
     * Indicates this property is serializable, if no other explicit visibility decorators(`@serializable`s) are attached.
     */
    IMPLICIT_SERIALIZABLE = 1 << 2,
}