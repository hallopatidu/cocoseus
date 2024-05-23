import { _decorator, Asset, Component, js, Node } from 'cc';
import { EDITOR } from 'cc/env';
import { Support } from './Support';
const { ccclass, property } = _decorator;

export type SimpleAssetInfo = {
    name?:string,
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
    private static async getAssetInfo_Editor(uuid:string):Promise<SimpleAssetInfo>{
        if(EDITOR){
            // Underconstructor
            const assetInfo:AssetInfo = await globalThis.Editor.Message.request('asset-db', 'query-asset-info', uuid) as AssetInfo;
            if(assetInfo){
                const assetURL:string = assetInfo.url.slice();
                const info:SimpleAssetInfo = await this.generateSimpleAssetInfoFromUrl_Editor(assetURL);
                if(info){
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
     * @param assetUrl 
     * @param simpleInfo 
     * @param generator 
     * @returns 
     */
    private static async generateSimpleAssetInfoFromUrl_Editor(assetUrl:string|null, simpleInfo?:SimpleAssetInfo, generator:Generator<string[]> = Support.getPartialPath(assetUrl)):Promise<SimpleAssetInfo|null>{
        if(EDITOR){
            const simpleAssetInfo:SimpleAssetInfo = simpleInfo || js.createMap();
            const pathInfos:string[] = generator.next()?.value;            
            if(pathInfos && pathInfos.length){         
                const path:string = pathInfos[0];
                const assetName:string = pathInfos[1]
                if(path && path.length){
                    
                    const meta:AssetMeta = await globalThis.Editor.Message.request('asset-db', 'query-asset-meta', 'db://' + path);
                    if(meta && meta.userData && meta.userData?.isBundle){
                        simpleAssetInfo.bundle = meta.userData?.bundleName || assetName;
                        simpleAssetInfo.url = assetUrl.replace('db://' + path,'').replace(/\.[^/.]+$/, "");                        
                    };            
                    return await this.generateSimpleAssetInfoFromUrl_Editor(assetUrl, simpleAssetInfo, generator) || simpleAssetInfo
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

    static async getAssetInfo(asset:Asset):Promise<SimpleAssetInfo>{
        return EDITOR ?  await this.getAssetInfo_Editor(asset.uuid) : null;
    }

}


