import { _decorator, assetManager, AssetManager, Component, Enum, error, instantiate, log, Node, Prefab, Vec3 } from 'cc';
// import Referencify from '../core/Referencify';
// import { BabelPropertyDecoratorDescriptor, IPropertyOptions, LegacyPropertyDecorator, PropertyType } from '../types/CoreType';
import { DEV, EDITOR } from 'cc/env';
import { CCEditor, SimpleAssetInfo } from '../utils/CCEditor';
import { Support } from '../utils/Support';
const { ccclass, property, executeInEditMode } = _decorator;

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
@executeInEditMode(true)
export class RemotePrefab extends Component {
    @property({serializable:true})
    private _prefab:Prefab = null;

    @property({serializable:true})
    private prefabInfo:SimpleAssetInfo = null;
    
    @property({
        type:Prefab,
        visible(){
            return !this.prefabInfo
        }
    })
    get prefab():Prefab{        
        if(this.prefabInfo){
            CCEditor.enumifyProperty(this, 'enumPrefab', Support.convertToEnum(['REMOVE', this.prefabInfo.url]))
        }
        return this._prefab;
    }

    set prefab(asset:Prefab){        
        this.checkForEmbedingOrLoading(asset);
    }

    @property({
        type:PrefabNameEnum,
        displayName:'Prefab',
        visible(){
            return !!this.prefabInfo
        }
    })
    get enumPrefab():number{
        
        return  !!this.prefabInfo ? 1:0;
    }

    set enumPrefab(val:number){
        // this._enumPrefab = val
        if(val == 0){
            this.prefab = null;
            this.prefabInfo = null;
        }
    }

    // ----------------

    /**
     * 
     * @param asset 
     */
    private async checkForEmbedingOrLoading(asset:Prefab){
        if(EDITOR && !!asset){
            const assetInfo:SimpleAssetInfo = await CCEditor.getAssetInfo(asset);
            const bundleName:string = assetInfo.bundle;            
            if(bundleName == AssetManager.BuiltinBundleName.RESOURCES){                
                log('asset name: ' + asset.name + ' asset.nativeUrl:  ' + assetInfo.url + ' assetInfo.name: ' + assetInfo.name);                
                this.prefabInfo = assetInfo;
                CCEditor.enumifyProperty(this, 'enumPrefab', Support.convertToEnum(['REMOVE', assetInfo.url]))
            }else{                
                this._prefab = asset;
            }
            
        }

    }

    /**
     * 
     * @param assetInfo 
     */
    private async loadPrefab(assetInfo:SimpleAssetInfo):Promise<Prefab>{
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
            const prefabPath:string = assetInfo.url;
            let remotePrefab:Prefab = bundle.get(prefabPath, Prefab);
            if(!remotePrefab){
                remotePrefab = await new Promise((resolve:Function)=>{
                    bundle.load(prefabPath, Prefab, (err:Error, prefab:Prefab ) =>{                
                        if(!err){                                               
                            // this.instantiateLoadedPrefab(prefab);
                            resolve(prefab)
                        }else{
                            DEV && error('Prefab Loading Error: ' + prefabPath + ' with bundle: ' + bundle.name + ' -node ' + this.node.getPathInHierarchy() )       
                            resolve(null);
                        }     
                        
                    })
                })
            }
            if(!remotePrefab) {
                error('Prefab ' + prefabPath + ' in bundle '+ bundleName + ' is not found !');
                return null
            }
            log('load prefab success')
            return remotePrefab
        }else{

        }
    }


    // -----------

    protected async startLoadAssets(){

    }

    /**
     * 
     */
    protected onLoad(): void {
        if(this.prefabInfo){
            this.loadPrefab(this.prefabInfo).then((prefab:Prefab)=>{
                if(!prefab){ !EDITOR && DEV && error('There is no prefab !')}
                const contentNode:Node = instantiate(prefab);
                contentNode.setPosition(new Vec3())
                this.node.addChild(contentNode);
            });
        }
    }

}


