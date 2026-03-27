import { __private, _decorator, Enum, sp } from 'cc';
import { PipelineStatus } from '../pipelines/PipelineType';

export interface ISpineView {
    get spine(): sp.Skeleton | null;
    set spine(value: sp.Skeleton | null);
    get duration(): number;
    play(duration?:number): Promise<string>;
    stop():void;
    skip():void;
    loopInTime(duration:number): Promise<string>;
    activeLoop(value:boolean):void
    get active():boolean
    set active(value:boolean)
    getAnimation():string
    getSkin():string
    get repeatTime():number
}

export const EditorMode = {
    Prefab:'prefab',
    Animation:'animation',
    General:'general'
}

// 
export type SpSkeletonType = sp.Skeleton & {
    _cacheMode:typeof sp.Skeleton.AnimationCacheMode,
    _curFrame:__private._cocos_spine_skeleton_cache__AnimationFrame,
    _animCache:__private._cocos_spine_skeleton_cache__AnimationCache,
    _isAniComplete:boolean,
    _animationQueue:__private._cocos_spine_skeleton__AnimationItem[],
    _headAniInfo:__private._cocos_spine_skeleton__AnimationItem,
    _accTime:number,
    _instance: sp.spine.SkeletonInstance,
    _updateCache:(dt:number)=>void,
    markForUpdateRenderData:(enable?:boolean)=>void
}

export type SpineStatus = PipelineStatus;

export type SpineStateOption = {    
    spine?:sp.Skeleton
} & {status: SpineStatus}
