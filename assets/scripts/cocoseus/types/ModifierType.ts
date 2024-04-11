// export type Constructor<T> = new (...args: any[]) => T;


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

