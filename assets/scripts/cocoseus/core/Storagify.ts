import { _decorator, Component, Constructor, Node } from 'cc';
import { Inheritancify } from './Inheritancify';
import { IStaticStoragified, IStoragified } from '../types/CoreType';
import { Support } from '../utils/Support';
const { ccclass, property } = _decorator;

const StorageDB:Map<number, Map<string, any>> = new Map<number, Map<string, any>> ()
/**
 * 
 * @param base 
 * @returns 
 */
export default Inheritancify<IStoragified, IStaticStoragified>(function Storagify <TBase>(base:Constructor<TBase>):Constructor<TBase & IStoragified>{ 

    /**
     * CRUD
     */
    class Storagified extends (base as unknown as Constructor<Component>) implements IStoragified {
        static create(){}
        static read(){}
        static update(){}
        static delete(){}

        // static select(){}
        // static search(){}        
        static table<TData>(name:string):Map<string, TData>{
            const token:number = Support.tokenize(name);
            if(!StorageDB.has(token)) StorageDB.set(token, new Map<string, TData>())
            return StorageDB.get(token) as unknown as Map<string, TData>
        }

        static save(){}
        static provider(){}

        

    }
    
    return Storagified  as unknown as Constructor<TBase & IStoragified>;
})


