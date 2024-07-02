import { _decorator, Component, Constructor, log, Node, sys } from 'cc';
import { Inheritancify } from './Inheritancify';
import { IStaticStoragified, IStoragified } from '../types/CoreType';
import { Support } from '../utils/Support';
const { ccclass, property } = _decorator;

export const StoragifyName:string = 'Storagify';

const SettingStorage:Map<number, Map<string, any>> = new Map<number, Map<string, any>> ();
// class ClientStorage {}
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
            if(!SettingStorage.has(token)) SettingStorage.set(token, new Map<string, TData>());
            return SettingStorage.get(token) as unknown as Map<string, TData>
        }

        static save(){            
            // sys.localStorage.setItem('editor_storage', JSON.stringify(SettingStorage));
        }

        static provider(){}

        protected select(dbName:string):IStoragified{
            return
        }

        protected record(){

        }

    }
    
    return Storagified  as unknown as Constructor<TBase & IStoragified>;
}, StoragifyName)


