// Referencify

import { _decorator, Component, Constructor, director, find } from "cc";
import { ReferenceInfo, IReferencified,  IStaticReferencified } from "../types/CoreType";
import { Support } from "../utils/Support";
import { Inheritancify } from "./Inheritancify";
import Storagify from "./Storagify";

const { ccclass, property } = _decorator;

export const ReferenciyInjector:string = 'Referencify';

// const ImageFmts = ['.png', '.jpg', '.bmp', '.jpeg', '.gif', '.ico', '.tiff', '.webp', '.image', '.pvr', '.pkm', '.astc'];
// const AudioFmts = ['.mp3', '.ogg', '.wav', '.m4a'];
// const FileExts = ImageFmts.concat(AudioFmts);
/**
 * 
 * @param base 
 * @returns 
 */
export default Inheritancify<IReferencified, IStaticReferencified>(function Referencify <TBase>(base:Constructor<TBase>):Constructor<TBase & IReferencified>{             
    class Referencified extends Storagify(base as unknown as Constructor<Component>) implements IReferencified {
        
        protected _refInfo:ReferenceInfo;

        protected _token:number = -1

        private static _references:Map<number, ReferenceInfo>;

        private static _keys:Map<number, string>;

        /**
         * Key đươc sinh ra từ ReferenceInfo.
         * 
         * @param info 
         * @returns 
         */
        private static genKey(info:ReferenceInfo):string{            
            return (info?.root ? Support.tokenize(info.root) + '.' : '') + 
                    (info?.node ? Support.pathToToken(info?.node) + '.' : '') +
                    (info?.comp ? Support.tokenize(info?.comp) + '.'  : '') + 
                    (info?.id ? Support.tokenize(info?.id?.toString()) : '0')+
                    (info?.property ? Support.tokenize(info?.property?.toString()) : '')
        }

        /**
         * Token được sinh ra từ key.
         * 
         * @param info 
         * @returns 
         */
        private static genToken(info:ReferenceInfo):number{
            return Support.tokenize(this.genKey(info));
        }

        /**
         * 
         */
        private static get references():Map<number, ReferenceInfo>{
            if(!this._references){
                this._references = Storagify(this).table<ReferenceInfo>(Referencify.name);
            }
            return this._references;
        }
        
        /**
         * 
         */
        private static get keys():Map<number, string>{
            if(!this._keys){
                this._keys = Storagify(this).table<string>(Referencify.name+'.keys');
            }
            return this._keys;
        }
        

        /**
         * 
         * @param comp 
         */
        private static register(comp:IReferencified){
            this.references.set(comp.token, comp.refInfo);
            this.keys.set(comp.token, this.genKey(comp.refInfo));
            // List referenced components
            // const refPaths:string[] = [];
            // const comps:IReferencified[] = [];
            // Referencified.keys.forEach((value:string, token:number)=>{
            //     refPaths.push(Referencified.getRefPath(token));
            //     comps.push(Referencified.getComponent(token));
            // })
            // // 
            // const ReferenceEnum:any = Support.convertToEnum(refPaths);            
            // comps.forEach((serachComp:IReferencified)=>{
            //     serachComp.updateReferenceEnum && serachComp.updateReferenceEnum(ReferenceEnum);
            // })

            // const json:string = JSON.stringify(Array.from(this.references)); 
            // const map:Map<any,any> = new Map(JSON.parse(json));
            // scene:component-removed
            // log('All:: ' + json) ;            
        }

        /**
         * 
         * @param comp 
         * @returns 
         */
        private static hasRegisted(comp:IReferencified):boolean{
            return this.references.has(comp.token)
        }
        
        /**
         * 
         * @param comp 
         */
        private static remove(comp:IReferencified){
            this.references.delete(comp.token);
            this.keys.delete(comp.token);            
        }

        
        /**
         * 
         * @param token 
         * @returns 
         */
        static getRefPath(token:number):string{
            const refInfo:ReferenceInfo = this.getRefInfo(token);
            return '[' + refInfo?.comp + ']' + (refInfo.id ? '(' +refInfo.id+')' : '' ) + '<' + refInfo?.node + '>' + '%' + refInfo.root + '%';
        }

        /**
         * 
         * @param token 
         * @returns 
         */
        static getRefInfo(token:number):ReferenceInfo{
            return Referencified.references.get(token);
        }

        /**
         * 
         * @param token 
         * @returns 
         */
        static getComponent<T=Component>(token:number):T{
            const info:ReferenceInfo = Referencified.getRefInfo(token);            
            return find(info.node)?.getComponents(info.comp)?.find((comp, index)=> index == info.id) as T;
        }

        /**
         * 
         * @param searchValue 
         * @returns 
         */
        static findToken(searchValue:string):number{
            const searchToken:string = Support.tokenize(searchValue.trim()).toString();
            const shortcutToken:string = Support.searchStringArray(searchToken, Array.from(this.keys.values()))
            return shortcutToken ? Support.tokenize(shortcutToken) : -1;
        }

        /**
         * 
         * @param token 
         * @returns 
         */
        static validToken(token:number):boolean{
            return Referencified.references.has(token);
        }

        

        /**
         * 
         */
        public get internalOnLoad (): (() => void) | undefined {
            !Referencified.hasRegisted(this) && Referencified.register(this);
            return super['internalOnLoad'];
        }



        /**
         * 
         */
        public get internalOnDestroy (): (() => void) | undefined {
            Referencified.hasRegisted(this) && Referencified.remove(this);
            return super['internalOnDestroy']
        }

        /**
         * 
         */
        get token():number{
            if(!this._token || this._token == -1){
                this._token = Referencified.genToken(this.refInfo)
            }
            return this._token
        }

        /**
         * 
         */
        get refInfo():ReferenceInfo{
            if(this.node && !this._refInfo){
                const hierachyPath:string = this.node.getPathInHierarchy();
                const compName:string = this.constructor.name;
                const orderIndex:number = this.node.getComponents(compName).findIndex((_comp:Component)=>_comp === this)||0;                
                this._refInfo = {
                    root:director.getScene().name,
                    node:hierachyPath,
                    comp:compName,
                    id:orderIndex
                }
            }
            return this._refInfo;
        };

        /**
         * 
         */
        // updateReferenceEnum(enumData:any):void{            
        //     return
        //     const propertyNames:string[] = Array.from( Decoratify(this).keys('@reference'));
        //     propertyNames.forEach((propName:string)=>{
        //         const enumPropertyName:any = ENUM_PROPERTY_PREFIX + propName;
        //         CCEditor.enumifyProperty(this, enumPropertyName, enumData);
        //     })
        // }

    }
    return Referencified as unknown as Constructor<TBase & IReferencified>;

}, ReferenciyInjector) 
