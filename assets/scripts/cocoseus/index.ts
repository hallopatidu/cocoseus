import { Asset, AssetManager, Constructor, Enum, error, js } from "cc";
import { makeSmartClassDecorator } from "./plugins/PluginClassify";
import { BabelPropertyDecoratorDescriptor, EmbedAsset, IPropertyOptions } from "./types/CoreType";
import { CCEditor, SimpleAssetInfo } from "./utils/CCEditor";
import { EDITOR } from "cc/env";
import { Support } from "./utils/Support";

const CACHE_KEY = '__ccclassCache__';

/**
 * 
 * cocoseus : cocos extendable upgrading system
 * 
 */
export namespace cocoseus {
    

    export const propertyDynamicLoading: ((name?: string) => ClassDecorator) & ClassDecorator = makeSmartClassDecorator<string>((constructor, name) => {
        const cache = constructor[CACHE_KEY];
        if (cache) {
            const decoratedProto = cache.proto;
            if (decoratedProto) {
                // decoratedProto.properties = createProperties(ctor, decoratedProto.properties);
                const keys:string[] = Object.keys(decoratedProto.properties);
                keys.forEach((key:string)=>{
                    remakeProperty(constructor, key, decoratedProto.properties[key])
                })
                
            }
        }
    
        return constructor //Referencify(constructor)
    });
    
}

//  TEST
function remakeProperty(constructor, propertyName:string, options:IPropertyOptions){
    const isAsset:boolean = js.isChildClassOf(getClassType((options as IPropertyOptions)?.type), Asset)
    if(isAsset){
        const propertyDescriptor:BabelPropertyDecoratorDescriptor = js.getPropertyDescriptor(constructor, propertyName);
        defineSmartProperty(constructor, propertyName, options, propertyDescriptor)
    }
}

// -------------------------------------------------------------------

export const ReferenciyInjector:string = 'Referencify';
export const ENUM_PROPERTY_PREFIX:string = '__$enum__';
export const INDEX_PROPERTY_PREFIX:string = '__$id__';
export const STRING_PROPERTY_PREFIX:string = '__$string__';
export const INFO_PROPERTY_PREFIX:string = '__$info__';
export const WRAPPER_PROPERTY_PREFIX:string = '__$';
export const PREFAB_DETAIL_PREFIX:string = '__$prefab__';

/**
 * 
 * @param classTypes 
 * @returns 
 */
function getClassType(classTypes:Constructor<any>|Constructor<any>[]):Constructor<any>{
    if(!classTypes) return null;
    const classType:Constructor<any> = Array.isArray(classTypes) ? classTypes[0] : classTypes;
    if(!classType) error('Type is empty !');
    return classType;
}


/**
 * 
 * @param target 
 * @param propertyName 
 * @param options 
 * @param descriptorOrInitializer 
 */
function defineSmartProperty(target:Record<string, any>, propertyName:string, options:IPropertyOptions, descriptorOrInitializer:  BabelPropertyDecoratorDescriptor){
    const enumPropertyName:any = ENUM_PROPERTY_PREFIX + propertyName;
    const wrapperPropertyName:any = WRAPPER_PROPERTY_PREFIX + propertyName;    
    const infoPropertyName:any = INFO_PROPERTY_PREFIX + propertyName;
    // 
    
    // Record info -------------
    const infoPropertyDescriptor:PropertyDescriptor = {value:null, writable:true}    
    const infoOption:IPropertyOptions = {serializable:true, visible:false};
    CCEditor.createEditorClassProperty(target, infoPropertyName,infoOption, infoPropertyDescriptor);
    // -------------------------- End info
    
    // Define Enum ------------------------------
    const enumPropetyDescriptor:PropertyDescriptor = {
        get():number{
            return !!this[infoPropertyName] ? 1:0;
        },
        set(val:number){
            if(val == 0){
                this[wrapperPropertyName] = null;
                this[infoPropertyName] = null;
                this[propertyName] = null;
                EDITOR && this.onEditorAssetChanged(propertyName);
            }
        }
    }
    //
    const enumOption:IPropertyOptions = {
        type:Enum({NONE:0}),
        displayName:Support.upperFirstCharacter(propertyName),
        visible(){
            return !!this[infoPropertyName]
        }
    }
    CCEditor.createEditorClassProperty(target, enumPropertyName, enumOption, enumPropetyDescriptor);
    // ------------------------------ end Define Enum
    
    // Define Wrapper ------------------------------
    const wrapperDescriptor:PropertyDescriptor = {
        get():EmbedAsset{                
            if(this[infoPropertyName]){
                const assetPath:string = this[infoPropertyName]?.url + ' [' + this[infoPropertyName]?.bundle + ']';
                CCEditor.enumifyProperty(this, enumPropertyName, Support.convertToEnum(['REMOVE', assetPath]));                
            }            
            return this[propertyName];
        },
        set:async function(asset:EmbedAsset){
            if(EDITOR){
                const assetInfo:SimpleAssetInfo = await this.analysisAsset(propertyName, asset);
                if(!!assetInfo){
                    const bundleName:string = assetInfo.bundle;
                    //       
                    if( !!bundleName &&
                        bundleName !== AssetManager.BuiltinBundleName.INTERNAL &&
                        bundleName !== AssetManager.BuiltinBundleName.MAIN  &&
                        bundleName !== AssetManager.BuiltinBundleName.START_SCENE){
                        // 
                        this[infoPropertyName] = assetInfo;
                        const assetPath:string = this[infoPropertyName]?.url + ' [' + this[infoPropertyName]?.bundle + ']';
                        CCEditor.enumifyProperty(this, enumPropertyName, Support.convertToEnum(['REMOVE', assetPath]));
                        this[propertyName] = null
                        // this.onEditorAssetChanged(propertyName);
                        return false
                        // 
                    }else{
                        this[infoPropertyName] = null;
                    }
                }
                
            }
            // 
            this[propertyName] = asset;
            // EDITOR && this.onEditorAssetChanged(propertyName);
        },
        // configurable: descriptorOrInitializer.configurable,
        // enumerable: descriptorOrInitializer.enumerable,
        // writable: descriptorOrInitializer.writable,        
    } as PropertyDescriptor;

    const wrapperOption:IPropertyOptions = Object.assign({}, options, {
        displayName:Support.upperFirstCharacter(propertyName),
        visible(){
            return !this[infoPropertyName];
        }
    }) as IPropertyOptions;
    CCEditor.createEditorClassProperty(target, wrapperPropertyName, wrapperOption, wrapperDescriptor)
    
    // ------------------------------------- end Define Wrapper

    // Current property ---------------
    if(!!options){
        (options as IPropertyOptions).visible = false;
        (options as IPropertyOptions).serializable = true;    
    }
    // CCEditor.createEditorClassProperty(target, propertyName, options, descriptorOrInitializer);
    
}
// -------------------------------------------------------------------