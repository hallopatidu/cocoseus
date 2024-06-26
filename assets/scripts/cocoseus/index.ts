import { Asset, AssetManager, CCString, Component, Constructor, Enum, _decorator, error, js, log } from "cc";
import { makeSmartClassDecorator } from "./plugins/PluginClassify";
import { BabelPropertyDecoratorDescriptor, EmbedAsset, IPropertyOptions, LegacyPropertyDecorator, SimpleAssetInfo } from "./types/CoreType";
import { CCEditor } from "./utils/CCEditor";
import { EDITOR } from "cc/env";
import { Support } from "./utils/Support";
import PropertyLoadify from "./core/PropertyLoadify";
const { ccclass, property } = _decorator;
const CACHE_KEY = '__ccclassCache__';

/**
 * 
 * cocoseus : cocos extendable upgrading system
 * 
 */
export namespace cocoseus {   

    export const propertyDynamicLoading:  ((name?: string) => ClassDecorator) & ClassDecorator = makeSmartClassDecorator<string>((constructor, name) => {
        return PropertyLoadify(constructor);
    })
    
}


