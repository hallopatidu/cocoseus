import { _decorator, AssetManager, Component, Enum, log, Node, Prefab } from 'cc';
import Referencify from '../core/Referencify';
import { BabelPropertyDecoratorDescriptor, IPropertyOptions, LegacyPropertyDecorator, PropertyType } from '../types/CoreType';
import { EDITOR } from 'cc/env';
import { CCEditor, SimpleAssetInfo } from '../utils/CCEditor';
import { Support } from '../utils/Support';
const { ccclass, property } = _decorator;

// export type SimpleAssetInfo = {
//     uuid?:string,
//     url?:string,
//     bundle?:string,
//     // isLoaded?:boolean
// }


/**
 * Phù hợp với việc sử dụng trong prefab độc lập để trỏ đến một component ngoài scene.
 * @param options 
 */
// function __$prefab__(options?: IPropertyOptions|string|unknown): LegacyPropertyDecorator;
// function __$prefab__(type?: PropertyType): LegacyPropertyDecorator;
// function __$prefab__(...args: Parameters<LegacyPropertyDecorator>): void;
// function __$prefab__(
//     target?: Parameters<LegacyPropertyDecorator>[0]| PropertyType, 
//     propertyKey?: Parameters<LegacyPropertyDecorator>[1], 
//     descriptorOrInitializer?: BabelPropertyDecoratorDescriptor
// ){
//     let options: string|IPropertyOptions | PropertyType | null | unknown = null;    
//     function normalized (target: Parameters<LegacyPropertyDecorator>[0],
//         propertyKey: Parameters<LegacyPropertyDecorator>[1],
//         descriptorOrInitializer:  BabelPropertyDecoratorDescriptor)
//     {     
//         // Truy xuất vào Injector cua mot prototype
//         // Decoratify(target).record(propertyKey.toString(), '@reference');
//         // lastInjector<IStaticReferencified>(target).findToken()
//         // const constructor:any = target.constructor;
//         const propertyName:string = propertyKey.toString();
//         // const enumPropertyName:any = ENUM_PROPERTY_PREFIX + propertyName;
//         // const indexEnumPropertyName:any = INDEX_PROPERTY_PREFIX + propertyName;
//         // const stringPropertyName:any = STRING_PROPERTY_PREFIX + propertyName;
//         // // 
//         // const classStash:unknown = constructor[CACHE_KEY] || ((constructor[CACHE_KEY]) = {});
//         // const ccclassProto:unknown = classStash['proto'] || ((classStash['proto'])={});
//         // const properties:unknown = ccclassProto['properties'] || ((ccclassProto['properties'])={});
//         // const enumPropertyStash:unknown = properties[enumPropertyName] ??= {};    
//         // // 
//         // const enumPropertyRecordOptions:any = {            
//         //     displayName: ''+ propertyName.replace(/\b\w/g, c => c.toUpperCase()).replace(/(?=[A-Z])/g,' ')+'',  // upper first character
//         //     // visible:true
//         // }
        
        
//         // 
//         if(!options){
//             options = {};
//         }
//         if(!(options as IPropertyOptions).type){
//             // (options as IPropertyOptions).type = ReferenceEnum;
//             (options as IPropertyOptions).visible = function(){return true};
//             (options as IPropertyOptions).displayName = ''+ propertyName.replace(/\b\w/g, c => c.toUpperCase()).replace(/(?=[A-Z])/g,' ')+'';  // upper first character
//         }
//         // ((options ??= {}) as IPropertyOptions).type = Component;
//         const propertyNormalized:LegacyPropertyDecorator = property(options);
//         propertyNormalized(target as Parameters<LegacyPropertyDecorator>[0], propertyKey, descriptorOrInitializer);
//         return descriptorOrInitializer
//     }
    

//     if (target === undefined) {
//         // @audio() => LegacyPropertyDecorator
//         return __$prefab__({
//             type: Prefab,
//         });
//     } else if (typeof propertyKey === 'undefined') {
//         options = target;
//         return normalized;
//     } else {
//         // @audio
//         normalized(target as Parameters<LegacyPropertyDecorator>[0], propertyKey, descriptorOrInitializer);
//         return undefined;
//     }
    
// }

let PrefabNameEnum = Enum({REMOVE:0})
/**
 * 
 */
@ccclass('RemotePrefab')
export class RemotePrefab extends Component {
    @property({serializable:true})
    private _prefab:Prefab;
    @property({serializable:true})
    private _enumPrefab:number;
    @property({serializable:true})
    private _infoPrefab:SimpleAssetInfo;
    
    @property({
        type:Prefab,
        visible(){
            return !this._prefab
        }
    })
    get prefab():Prefab{
        // log('--------AAAA get prefab')
        // this.checkForEmbedingOrLoading(this._prefab);
        return this._prefab;
    }

    set prefab(asset:Prefab){
        this._prefab = asset;
        this.checkForEmbedingOrLoading(asset);
    }

    @property({
        type:PrefabNameEnum,
        displayName:'Prefab',
        visible(){
            return !!this._enumPrefab
        }
    })
    get enumPrefab():number{
        return this._enumPrefab;
    }

    set enumPrefab(val:number){
        this._enumPrefab = val
        
    }

    // -----------
    private isRemoted:boolean = false

    // -----------

    /**
     * 
     * @param asset 
     */
    private async checkForEmbedingOrLoading(asset:Prefab){
        if(EDITOR && asset){
            const assetInfo:SimpleAssetInfo = await CCEditor.getAssetInfo(asset);
            const bundleName:string = assetInfo.bundle;
            const isRemoted:boolean = Boolean(bundleName == AssetManager.BuiltinBundleName.RESOURCES);
            if(isRemoted){                
                log(this.node.name + 'asset name: ' + asset.name + ' asset.nativeUrl:  ' + assetInfo.url + ' assetInfo.name: ' + assetInfo.name);
                this._prefab = null;
                this._infoPrefab = assetInfo;
                const enumAsset:any = Support.convertToEnum(['REMOVE',assetInfo.url]);
                Support.enumifyProperty(this, 'enumPrefab', enumAsset);
                this.enumPrefab = 1;
            }else{
                this._infoPrefab = null;
                this._prefab = asset;
                
            }
            
        }

    }


    // -----------
    protected onLoad(): void {

        Support.editorProperty(this, 'enumPrefab', !!this._infoPrefab)
        Support.editorProperty(this, 'prefab', !this._infoPrefab)
    }
}


