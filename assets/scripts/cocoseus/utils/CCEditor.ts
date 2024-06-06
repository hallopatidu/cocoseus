import { _decorator, Asset, CCClass, Component, Enum, js, Node } from 'cc';
import { EDITOR } from 'cc/env';
import { Support } from './Support';
import { IPropertyOptions, LegacyPropertyDecorator, PropertyType } from '../types/CoreType';
const { ccclass, property } = _decorator;

export type SimpleAssetInfo = {
    name?:string,
    type?:string,
    uuid?: string;
    url?: string;
    bundle?: string    
}

type  AssetMeta = {
    files: string[];
    imported: boolean;
    importer: string;
    subMetas: {
        [id: string]: any;
    };
    userData: {
        [key: string]: any;
        bundleConfigID?: string,
        bundleName?: string,
        isBundle?: true,
        priority?: number
    };
    uuid: string;
    ver: string;
}

type AssetInfo = {
    name: string;
    displayName: string;
    source: string;
    path: string;
    url: string;    
    file: string;    
    uuid: string;    
    importer: string;    
    type: string;    
    isDirectory: boolean;    
    library: { [key: string]: string };    
    subAssets: { [key: string]: AssetInfo };    
    visible: boolean;    
    readonly: boolean;    
    instantiation?: string;    
    redirect?: any;
    extends?: string[];
    imported: boolean;
    invalid: boolean;
}

@ccclass('CCEditor')
export class CCEditor {

    /**
     * await Editor.Message.request('asset-db', 'query-asset-info', urlOrUUIDOrPath);
     * @param uuid 
     * @returns 
     */
    private static async getAssetInfo_Editor(uuid:string):Promise<SimpleAssetInfo>{
        if(EDITOR){
            // Underconstructor
            const assetInfo:AssetInfo = await globalThis.Editor.Message.request('asset-db', 'query-asset-info', uuid) as AssetInfo;
            if(assetInfo){
                // const assetURL:string = assetInfo.url.slice();
                const assetPath:string = assetInfo.path.slice();
                const info:SimpleAssetInfo = await this.generateSimpleAssetInfoFromUrl_Editor(assetPath);
                if(info){
                    if(assetInfo.type){
                        info.type = assetInfo.type;
                    }
                    info.uuid = uuid;
                    info.name = assetInfo.name;
                    // info.url = assetInfo.path
                    return info
                }

            }            
        }        
        return null
    }

    /**
     * 
     * @param assetPath 
     * @param simpleInfo 
     * @param generator 
     * @returns 
     */
    private static async generateSimpleAssetInfoFromUrl_Editor(assetPath:string|null, simpleInfo?:SimpleAssetInfo, generator:Generator<string[]> = Support.getPartialPath(assetPath)):Promise<SimpleAssetInfo|null>{
        if(EDITOR){
            const simpleAssetInfo:SimpleAssetInfo = simpleInfo || js.createMap();
            const pathInfos:string[] = generator.next()?.value;            
            if(pathInfos && pathInfos.length){         
                const path:string = pathInfos[0];
                const assetName:string = pathInfos[1];
                if(path && path.length){                    
                    const meta:AssetMeta = await globalThis.Editor.Message.request('asset-db', 'query-asset-meta', 'db://' + path);
                    if(meta && meta.userData && meta.userData?.isBundle){
                        simpleAssetInfo.bundle = meta.userData?.bundleName || assetName;
                        simpleAssetInfo.url = assetPath.replace('db://' + path,'').replace(/\.[^/.]+$/, "");
                    };            
                    return await this.generateSimpleAssetInfoFromUrl_Editor(assetPath, simpleAssetInfo, generator) || simpleAssetInfo
                }
            }else{
                return simpleAssetInfo;
            }
        }
        return null;
    }

    // -----------------

    /**
     * 
     * @param uuid 
     * @returns 
     */
    static async getBundleName(asset:Asset):Promise<string>{
        if(EDITOR){
            const info:SimpleAssetInfo = await this.getAssetInfo_Editor(asset.uuid);
            return info.bundle;
        }
        return null
    }

    static async getSimpleAssetInfo(asset:Asset):Promise<SimpleAssetInfo>{
        return EDITOR && asset && asset.uuid ?  await this.getAssetInfo_Editor(asset.uuid) : null;
    }

    static enumifyProperty (targetObj:any, propName:string , newEnum:unknown):any {
        let defaultEnum = Object.assign( Enum({}) , newEnum);
        Enum['update'](defaultEnum);
        CCClass["Attr"].setClassAttr(targetObj, propName, 'type', 'Enum');
        CCClass["Attr"].setClassAttr(targetObj, propName, 'enumList', Enum["getList"](defaultEnum));
        return defaultEnum;
    }

    /**
     * 
     * @param targetObj 
     * @param propName 
     * @param propType 
     * @param value 
     */
    static changeEditorProperty(targetObj:any, propName:string , propType:string, value:any):any {
        CCClass["Attr"].setClassAttr(targetObj, propName, propType, value);
    }
    // 


    // 
    /**
     * 
     * @param target 
     * @param propertyName 
     * @param option 
     * @param propertyDescriptor 
     */
    static createEditorClassProperty(target:Record<string, any>, propertyName:string, option:IPropertyOptions, propertyDescriptor:PropertyDescriptor){   
        if(!Object.prototype.hasOwnProperty.call(target, propertyName)){
            Object.defineProperty(target, propertyName, propertyDescriptor);
            const propertyNormalized:LegacyPropertyDecorator = property(option);
            propertyNormalized(target as Parameters<LegacyPropertyDecorator>[0], propertyName, propertyDescriptor);
        }        
    }
    // 
}


