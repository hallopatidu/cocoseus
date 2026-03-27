import { Asset, Component, Constructor, Prefab, ValueType, __private, sp } from "cc"


export namespace cocoseus_types {
    // TYPE
    export type EmbedAsset = Asset|Node|Component

    // --------------- Parasitify --------

    export interface IParasitified<TSuper=any> {
        get super():TSuper
        get host():TSuper
    }

    export interface IStaticParasitified<TSuper=any> extends Constructor<IParasitified<TSuper>> {
    
    }

    // -------------- Interfacify --------
    export interface IOneFlowified extends Component {
        
    }

    export interface IStaticIOneFlowified extends Constructor<IOneFlowified> {
        
    }

    // -------------- AsyncProcessify --------

    export interface IAsyncProcessified {
        wait<TNextData = unknown>(token?:number):Promise<TNextData>
        begin(token?:number):void
        end(token?:number, data?:any):void
        isProgressing(token?:number):boolean
    }

    export interface IModifierState {
        
    }

    // ------------ Inheritancify -------------

    export interface IInheritancified extends Component {
    }

    // ------------ Decoratify ---------
    export interface IDecoratified extends IInheritancified {

    }

    export interface IStaticDecoratified extends Constructor<IDecoratified> {
        record(key:string,tag?:string):boolean
        remove(key:string, tag:string):boolean
        keys(tag?:string):string[]
    }

    // ------------ Actionify ---------


    export interface IActionized extends IReferencified{
        dispatch(action:Action, ...receiver:(string | number | Component)[]):void
        wait<TNextData = unknown>(target:string | number | Component):Promise<TNextData>
        _startDispatching(action:Action):void
        _stopDispatching(action:Action):void
    }

    export interface IStaticActionized extends Constructor<IActionized>{
        
    }

    // ------------ AsyncWaitify ---------
    export interface IAsyncWaited extends IStoragified {
        
    }

    export interface IStaticAsyncWaited extends Constructor<IAsyncWaited>{
        task(token:number):IAsyncProcessified
    }

    // ---------------------------
    export interface IPropertyExportified extends IInheritancified{
    }

    export interface IStaticPropertyExportified extends Constructor<IPropertyExportified>{

    }


    // ------------ LazyLoadify ------------
    export interface IPropertyLoadified extends IInheritancified{
        analysisAsset<T=EmbedAsset>(propertyName:string, asset:T):Promise<SimpleAssetInfo>;
        onLoadedAsset(propertyName:string, asset:SimpleAssetInfo):void;
        onEditorAssetChanged(propertyName:string):void;
    }

    export interface IStaticPropertyLoadified extends Constructor<IPropertyLoadified>{

    }
    // ------------ Referencify ------------

    export interface IReferencified extends IInheritancified{
        get refInfo():ReferenceInfo;
        get token():number;
        // analysisAsset<T=EmbedAsset>(propertyName:string, asset:T):Promise<SimpleAssetInfo>
        // onLoadedAsset(propertyName:string, asset:SimpleAssetInfo)
    }

    export interface IStaticReferencified extends Constructor<IReferencified>{
        getRefInfo(token:number):ReferenceInfo;
        getRefPath(token:number):string;
        getComponent<T>(token:number):T;
        validToken(token:number):boolean;
        findToken(searchValue:string):number;
        genToken(info:ReferenceInfo):number
    }

    // __private._cocos_core_event_eventify__IEventified

    // ---------------- Storagify -----------

    export interface IStoragified extends IInheritancified{

    }

    export interface IStaticStoragified extends Constructor<IStoragified>{
        table<TData>(name:string):Map<number, TData>
    }

    // -------------

    
    export type  AssetMeta = {
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

    export type AssetInfo = {
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


    export type SimpleAssetInfo = {
        name?:string,
        type?:string,
        uuid?: string;
        url?: string;
        bundle?: string    
    }

    export type PrefabInfo = SimpleAssetInfo & {
        references?:ReferenceInfo[]
    }

    export type ReferenceInfo = {
        root?:string,
        node?:string,
        property?:string,
        comp:string,
        id:number,    
    }

    export type StorageObject = {
        [n:number|string]:OriginalType
    }

    export type OriginalType = ValueType| string | number | null | undefined | Array<OriginalType>

    export type ActionObject = {
        [n:number|string]:ActionType
    }
    export type ActionType = object | string | number | Array<ActionObject> | Map<ActionType, ActionType> | Set<ActionType> | null | undefined;

    export type Action = {
        type:string,
        sender?:string,
        receiver?:string[],
        payload?: ActionObject | ActionType,
        stores?: ActionObject | ActionType,
        // shares?: ActionObject | ActionType
    }

    // export type ActionInfo = {
    //     type:string,
    //     method:string,
    //     ref:number
    // }



    export type Initializer = () => unknown;
    export type PrimitiveType<T> = __private._cocos_core_data_utils_attribute__PrimitiveType<T>;
    export type IExposedAttributes = __private._cocos_core_data_utils_attribute_defines__IExposedAttributes;
    export type ClassStash = IExposedAttributes & {
        default?: unknown;
        proto?: {
            properties?: Record<PropertyKey, PropertyStash>;
        };
        errorProps?: Record<PropertyKey, true>;
    }
    export type PropertyStash = IExposedAttributes & {
        default?: unknown,
        get?: () => unknown,
        set?: (value: unknown) => void,
        _short?: unknown,
        __internalFlags: number,
        __$extends?:DecorateHandlerType[],
        __$decorate:string
    }
    export type IPropertyOptions = __private._cocos_core_data_decorators_property__IPropertyOptions | __private._cocos_core_data_utils_attribute_defines__IExposedAttributes;
    export type PropertyType = __private._cocos_core_data_decorators_property__PropertyType;
    export type LegacyPropertyDecorator = __private._cocos_core_data_decorators_utils__LegacyPropertyDecorator;
    export type BabelPropertyDecoratorDescriptor = PropertyDescriptor & { initializer?: Initializer };
    export enum PropertyStashInternalFlag {
        CUSTOME = 1 << -1,  // custome property decorators. this Internal flag made by cocoseus.
        /**
         * Indicates this property is reflected using "standalone property decorators" such as
         * `@editable`, `@visible`, `serializable`.
         * All standalone property decorators would set this flag;
         * non-standalone property decorators won't set this flag.
         */
        STANDALONE = 1 << 0,

        /**
         * Indicates this property is visible, if no other explicit visibility decorators(`@visible`s) are attached.
         */
        IMPLICIT_VISIBLE = 1 << 1,

        /**
         * Indicates this property is serializable, if no other explicit visibility decorators(`@serializable`s) are attached.
         */
        IMPLICIT_SERIALIZABLE = 1 << 2,
    }

    export type DecoratePropertyType = ((options?: IPropertyOptions) => LegacyPropertyDecorator) 
                            | ((type: PropertyType)=> LegacyPropertyDecorator)
                            | ((...args: Parameters<LegacyPropertyDecorator>)=>void)
                            | ((target?: Parameters<LegacyPropertyDecorator>[0] | PropertyType, 
                                propertyKey?: Parameters<LegacyPropertyDecorator>[1],
                                descriptorOrInitializer?: Parameters<LegacyPropertyDecorator>[2])=> LegacyPropertyDecorator | undefined)

    export type DecorateHandlerType = (
                                        cache: ClassStash, 
                                        propertyStash: PropertyStash, 
                                        ctor: new () => unknown, 
                                        propertyKey: Parameters<LegacyPropertyDecorator>[1],
                                        options?:IPropertyOptions, 
                                        descriptorOrInitializer?: Parameters<LegacyPropertyDecorator>[2] | undefined )=>void;

    // export type DecorateExecutedType = ( cache: ClassStash, 
    //                                     propertyStash: PropertyStash, 
    //                                     ctor: new () => unknown, 
    //                                     propertyKey: Parameters<LegacyPropertyDecorator>[1])=>void;

    export type validateTBase<T> = T extends Constructor<Component> ? Constructor<T> : any;
    export type SubConstructor<T, TSub> =  new (...args: any[]) => T & TSub;

    export const DELIMETER:string = '$_$';
    export const CACHE_KEY = '__ccclassCache__';

    export const EditorMode = {
        Prefab:'prefab',
        Animation:'animation',
        General:'general'
    }

    export const EditorSendMessage = {
        Switch_Animation_Mode:'switch-animation-mode',   // params: [] - no params
        Open_Scene:'open-scene' // params ["a2c9f992-a5a2-4c0c-95c7-fb1f02043876"] - Prefab Asset UUID or SceneUUID
    }

    export const EditorRequestMessage = {
        Editor_Title_Change: 'editor-title-change',  // params:  ["BigMegaUltraWinPopup.prefab* - template-projects - Cocos Creator 3.8.2"]
        Record_Animation:'record-animation',     // params: ["82J6R7xxJMl4jJFDtuXXdd", true, "bd3b5355-6a6f-45be-ac01-d39139755430"] [Node UUID, on/off, .anim asset UUID]

        Query_Animation_Properties:'query-animation-properties', // params: ["f2TEZrP19Bnai3UKDGOZGL"] - [ Node UUID]
        Query_Animation_Clip:'query-animation-clip', // params: ["f2TEZrP19Bnai3UKDGOZGL","bd3b5355-6a6f-45be-ac01-d39139755430"] - [ Node UUID, .anim asset UUID]
        
        Query_Node:'query-node', // params: ["f2TEZrP19Bnai3UKDGOZGL"] - [ Node UUID] 
        Query_Animation_Root:'query-animation-root', // params: ["f2TEZrP19Bnai3UKDGOZGL"] - [ Node UUID] 
        Query_Animation_Edit_Info:'query-animation-edit-info', // params: ["f2TEZrP19Bnai3UKDGOZGL"] - [ Node UUID] 
        Staging:'staging', // params: [ { assetUuid: "a2c9f992-a5a2-4c0c-95c7-fb1f02043876", animationUuid: "", expandLevels: ["0","0_0","0_0_0","0_1"]} ]  - [{assetUuid: Prefab of Scene UUID - uuid cua asset thao tac voi animation}]
        Unstaging:'unstaging', // params: [ { assetUuid: "a2c9f992-a5a2-4c0c-95c7-fb1f02043876", animationUuid: "", expandLevels: ["0","0_0","0_0_0","0_1"]} ]  - [{assetUuid: Prefab of Scene UUID - uuid cua asset thao tac voi animation}]
        Query_Current_Scene:'query-current-scene',  // params [] - return asset uuid của Prefab hoặc Scene hiên tại dang hiển thị trên Editor.
        Open_Asset:'open-asset',
        Change_Clip_State:'change-clip-state',  // params ["stop","aba3ffbd-29ff-4178-b8d6-da919438872d"] "pause" "play" "resume"
        Set_Edit_Time:'set-edit-time',      // params [0.03333333333333333] next [0.05] thoi gian cong don theo frame time

        Create_Component:'create-component', // params: [uuid: nodeUuid, component: 'cc.Sprite'] - no params
    }

    export const EditorBoardcastMessage = {
        Selection_Unselect:'selection:unselect',
        Selection_Select:'selection:select',
    }

    export const EditorBoardcast = {
        Selection_Unselect:'selection:unselect',    // ["node","00Amvc0pFP2b/Gx1rZxwwO"]

    }







}


