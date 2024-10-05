import { Component, Constructor } from "cc";
import { IOneFlowified, IStaticIOneFlowified } from "../types/CoreType";
import { CCClassify } from "./Inheritancify";

export const OneFlowifyInjector:string = 'OneFlowify';
export default CCClassify<IOneFlowified, IStaticIOneFlowified>(function OneFlowify <TBase>(base:Constructor<TBase>):Constructor<TBase & IOneFlowified>{
    class OneFlowified extends (base as unknown as Constructor<Component>){
           
    }    
    return OneFlowified as unknown as Constructor<TBase & IOneFlowified>;
}, OneFlowifyInjector)



