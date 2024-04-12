// export type Constructor<T> = new (...args: any[]) => T;

import { __private } from "cc"


export interface IParasitified<TSuper> {
    get super():TSuper
}

export interface IAsyncProcessified {
    waitForReady(task?:string):Promise<any>
    execute():void
    ready(data?:any):void
}

export interface IOneFlowified {
    dispatch(action:Action, ...receiver:string[]):void
}

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


export type Initializer = () => unknown;
export type IPropertyOptions = __private._cocos_core_data_decorators_property__IPropertyOptions;
export type PropertyType = __private._cocos_core_data_decorators_property__PropertyType;
export type LegacyPropertyDecorator = __private._cocos_core_data_decorators_utils__LegacyPropertyDecorator;
export type BabelPropertyDecoratorDescriptor = PropertyDescriptor & { initializer?: Initializer };