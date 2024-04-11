// export type Constructor<T> = new (...args: any[]) => T;


export interface IParasitified<TSuper> {
    get super():TSuper
}

export interface IAsyncProcessified {
    waitForReady(task?:string):Promise<any>
    execute():void
    ready(data?:any):void
}