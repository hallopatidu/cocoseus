import { _decorator, Asset, assetManager, AssetManager, CCClass, Component, Enum, error, js, log, Node } from 'cc';
import { DEV, EDITOR } from 'cc/env';
import { SimpleAssetInfo } from '../types/CoreType';
const { ccclass, property } = _decorator;

@ccclass('Support')
export class Support extends Component {

    //  ------------------- Enum ------------------------
        
    static convertToEnum(objOrArray:any):any{
        const enumDef: {[key: string]: number} = {};
        const names:string[] = Array.isArray(objOrArray) ? objOrArray : Object.keys(objOrArray);
        names.forEach((bundle:string, index:number)=>enumDef[bundle] = index)
        return Enum(enumDef)
    }


    // ------------------------------------- RegEx + Math -------------------------------

    /**
     * Get the "title" for a file, by stripping other parts of the path as well as the extension.
     * @param path 
     * @returns 
     */
    static getFileTitle(path: string, extension:string = '.md'): string {
        if (path.includes("/")) path = path.substring(path.lastIndexOf("/") + 1);
        if (path.endsWith(".md")) path = path.substring(0, path.length - extension.length);
        return path;
    }

    /**
     * 
     * @param map 
     * @returns 
     */
    static mapToJson(map:Map<any,any>):string{
        return JSON.stringify( [...map].reduce((acc, [key, value]) => {acc[key] = value; return acc}, {}));
    }

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
        // Default
        if(!value) return 0
        let hash:number = 5381,i:number=value.length;      
        while(i) {
          hash = (hash * 33) ^ value.charCodeAt(--i);
        }
      
        /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
         * integers. Since we want the results to be always positive, convert the
         * signed int to an unsigned by doing an unsigned bitshift. */
        return hash >>> 0;
        // --------------------
        
    }

    /**
     * Hash funtion from The pharserJs lib.
     * @param value 
     * @returns 
     */
    static pharserJsHash(value:string):number{
        // Pharser Lib hash
        let h:number;
        let n:number;
        value = value.toString();
        for (var i = 0; i < value.length; i++)
        {
            n += value.charCodeAt(i);
            h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000;// 2^32
        }
        return (n >>> 0) * 2.3283064365386963e-10;// 2^-32
    }

    /**
     * 
     * @param str 
     * @param strOrRegxArray 
     * @returns 
     */
    static searchStringArray (str:string, strOrRegxArray:string[]) {        
        return strOrRegxArray.find((value:string)=> !!value.match(str))
    }

    /**
     * 
     * @param fullString 
     * @param signal 
     * @returns 
     */
    static getStringInsideSignal(fullString:string, signal:string = "<>"):string{
        if(fullString && fullString.length){
            const InsideSignalRegex:string = "/(?"+signal.charAt(0)+"=\\"+signal.charAt(0)+").+?(?=\\"+signal.charAt(1)+")/g;"
            const insideSignalStr:string[] = fullString.match(new RegExp(InsideSignalRegex))[0].split(/\s/g);
            if(insideSignalStr && insideSignalStr.length) return insideSignalStr[0];            
        }
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
     * @param path 
     * @returns 
     */
    static pathToToken(path:string):string{
        return path && path.indexOf('/') !== -1 ? path.split('/').map(nodeName=> Support.tokenize(nodeName)).join('.').toString() : Support.tokenize(path).toString();
    }

    /**
     * 
     * @param str 
     * @returns 
     */
    static upperFirstCharacter(str:string):string{
        return str.replace(/\b\w/g, c => c.toUpperCase()).replace(/(?=[A-Z])/g,' ').toString();
    }

    /**
    * 
    * @param fullPath 
    */
    static *getPartialPath(fullPath:string, decreases:boolean = false):Generator<string[]>{
        const partialPaths:string[] = fullPath.replace(/(db|http|https):\/\//g,'').split(/\/|\\/);
        let path:string = '';
        let baseUrl:string = '';
        // if(decreases){
        //     // while(partialPaths.length){

        //     // }
        // }else{
        while(partialPaths.length){
            path = partialPaths.shift();
            baseUrl += (baseUrl.length ? '/' : '') + path;
            yield [baseUrl, path];
        }
        // }
    }

    /**
     * 
     * @param array Push a unique primitive value to array.
     * @param item 
     */
    static pushUnique (array:Array<any>, item:any): void {
        if (array.indexOf(item) < 0) {
            array.push(item);
        }
    }

    // ------------- Data Structor -------------------
    /**
     * Detect Cycle in a Directed Graph Data . BFS solution (Bread First Search);
     * a BFS solution that will find one cycle (if there are any), which will be (one of) the shortest
     * Ex: var graph = {
     *     a: ['b', 'c'],
     *     b: ['d', 'c'],
     *     e: ['a', 'b'],
     *     d: ['e']
     * };
     * @param graph 
     * @returns 
     */
    static getCycle(graph:{[n:number]:number[]}) {
        let queue = Object.keys(graph).map( key => [key.toString()] );
        while (queue.length) {
            const batch = [];
            for (const path of queue) {
                const parents = graph[parseInt(path[0])] || [];
                for (const key of parents) {
                    if (key === parseInt(path[path.length-1])) return [key, ...path.map(key=>parseInt(key))];
                    batch.push([key, ...path.map(key=>parseInt(key))]);
                }
            }
            queue = batch;
        }        
    }

    static getSubTag<T, TKey extends keyof T> (obj: T, key: TKey): NonNullable<T[TKey]> {        
        return obj[key] as NonNullable<T[TKey]> || ((obj[key]) = {} as NonNullable<T[TKey]>);
    }

    // ------------------------ Loader -------------------------------
    /**
     * 
     * @param assetInfo 
     * @param classType 
     * @returns 
     */
    static async asyncLoadAssetFromSimpleAssetInfo(assetInfo:SimpleAssetInfo):Promise<Asset>{
        if(!assetInfo) return null
        if(!assetInfo.bundle?.length) error('Asset no bundle !!');
        if(!EDITOR){
            const bundleName:string = assetInfo.bundle;
            let bundle:AssetManager.Bundle = assetManager.getBundle(bundleName);
            if(!bundle){
                bundle = await new Promise<AssetManager.Bundle>((resolve:Function)=>{
                    assetManager.loadBundle(bundleName,(err:Error, downloadBundle:AssetManager.Bundle)=>{                   
                        if(!err){                               
                            resolve(downloadBundle);
                        }else{
                            DEV && error('Bundle Loading Error ' + err + ' bundle name: ' + bundleName);
                            resolve(null)
                        }                    
                    }) 
                })
            }
            if(!bundle){
                error('Bundle ' + bundleName + ' is not found !');
                return null
            }
            const assetPath:string = assetInfo.url;
            const classType:any = js.getClassByName(assetInfo.type);
            let remoteAsset:Asset = bundle.get(assetPath, classType);
            if(!remoteAsset){
                remoteAsset = await new Promise((resolve:Function)=>{
                    bundle.load(assetPath, classType, (err:Error, prefab:Asset ) =>{                
                        if(!err){                                               
                            // this.instantiateLoadedPrefab(prefab);
                            resolve(prefab)
                        }else{
                            DEV && error('Asset Loading Error: ' + assetPath + ' with bundle: ' + bundle.name)       
                            resolve(null);
                        }     
                        
                    })
                })
            }
            if(!remoteAsset) {
                error('Asset ' + assetPath + ' in bundle '+ bundleName + ' is not found !');
                return null
            }
    
            // DEV && warn('---- load success:: ' + assetInfo.name);
            return remoteAsset
        }else{
    
        }
        return
    } 

}


