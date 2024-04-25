import { _decorator, CCClass, Component, Enum, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Support')
export class Support extends Component {

    //  ------------------- Enum ------------------------
    static enumifyProperty (targetObj:any, propName:string , newEnum:unknown):any {
        let defaultEnum = Object.assign( Enum({}) , newEnum);
        Enum['update'](defaultEnum);
        CCClass["Attr"].setClassAttr(targetObj, propName, 'type', 'Enum');
        CCClass["Attr"].setClassAttr(targetObj, propName, 'enumList', Enum["getList"](defaultEnum));
        return defaultEnum
    }
    
    static convertToEnum(objOrArray:any):any{
        const enumDef: {[key: string]: number} = {};
        const names:string[] = Array.isArray(objOrArray) ? objOrArray : Object.keys(objOrArray);
        names.forEach((bundle:string, index:number)=>enumDef[bundle] = index)
        return Enum(enumDef)
    }


    // ------------------------------------- RegEx + Math -------------------------------

    /**
     * 
     * @param value 
     * @param canBeNegative 
     * @returns 
     */
    static getHashFromString(value: string, canBeNegative:boolean = false): string {       
        let hash:number = 0; //, i, chr;
        let chr:number;
        if (value.length === 0) return hash.toString();
        for (let i:number = 0; i < value.length; i++) {
          chr   = value.charCodeAt(i);
          hash  = ((hash << 5) - hash) + chr;
          hash |= 0; // Convert to 32bit integer
        }
        return canBeNegative ? hash.toString() : Math.abs(hash).toString();
    }

    /**
     * 
     * @param value 
     * @returns 
     */
    static hashString(value:string):number {        
        let hash:number = 5381,i:number=value.length;      
        while(i) {
          hash = (hash * 33) ^ value.charCodeAt(--i);
        }
      
        /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
         * integers. Since we want the results to be always positive, convert the
         * signed int to an unsigned by doing an unsigned bitshift. */
        return hash >>> 0;
    }

    /**
     * 
     * @param values 
     * @returns 
     */
    static tokenize(...values:string[]):number{
        const combineString:string = Array.from(values).join('.');
        return Support.hashString(combineString);
    }

    /**
     * 
     * @param str 
     * @returns 
     */
    static upperFirstCharacter(str:string):string{
        return str.replace(/\b\w/g, c => c.toUpperCase()).replace(/(?=[A-Z])/g,' ').toString();
    }

}


