import { _decorator, Animation, AnimationClip, sp, CCBoolean, error, assetManager, log, TweenSystem } from 'cc';
import { EDITOR } from 'cc/env';
import { AssetInfo } from '@cocos/creator-types/editor/packages/asset-db/@types/public';
import { SpineState } from 'db://cocoseus/scripts/widgets/spines/SpineState';
import { EditorMode, SpineStateOption, SpSkeletonType } from 'db://cocoseus/scripts/widgets/spines/SpineType';
import { cocoseus } from '../../definition/cocoseus';
const { ccclass, property, executeInEditMode, menu } = _decorator;
const { strings } = cocoseus.utils

const DefaultAnimationClipData = {
    __type__: "cc.AnimationClip",
    _name: "",
    _objFlags: 0,
    _native: "",
    sample: 60,
    speed: 1,
    wrapMode: 1,
    events: [],
    _duration: 50,
    _keys: [],
    _stepness: 0,
    curveDatas: {},
    _curves: [],
    _commonTargets: [],
    _hash: 0
}

// type AnimationClipData = typeof DefaultAnimationClipData
/**
 * author: coco.magic - hallopatidu
 * 
 */
@ccclass('SpineStatePreviewer')
@menu('Game Assistance/SpineStatePreviewer')
@executeInEditMode(true)
export class SpineStatePreviewer extends Animation {

    private static __runningPreviewerUuid: string = null

    static get isAnimationMode(): boolean {
        if (EDITOR) {
            const currentMode: string = Editor.EditMode.getMode();
            return currentMode == EditorMode.Animation;
        }
        return false;
    }

    // @property({serializable:true, visible:false})
    private _spine: sp.Skeleton = null;

    private _isRunning: boolean = false;

    private _spineState: SpineState = null;
    protected get spineState(): SpineState {
        // if(!this._spineState){
        //     const components:Component[] = this.getComponents(Component);  
        //     components.find((comp:Component)=>{
        //         if(comp instanceof SpineState){
        //             this._spineState = comp;
        //         }
        //         return comp  == this;
        //     });
        // }
        return this._spineState;
    }

    @property({ type: sp.Skeleton })
    public get spine(): sp.Skeleton {
        return this._spine;
    }
    public set spine(value: sp.Skeleton) {
        if (this._spine === value) return;
        this._spine = value;
        if (!SpineStatePreviewer.isAnimationMode) {
            if (value && value.skeletonData) {
                // this.updateSpine(value);    
                const skeletonData: sp.SkeletonData = value.skeletonData;
                const uuid: string = skeletonData.uuid;
                this.referenceAnimationAsset(uuid);

            } else if (value && !value.skeletonData) {
                error('Reference to Spine Component fail. You need SkeletonData Asset for this Spine Component !')
            } else {
                this.clips.forEach((clip: AnimationClip) => {
                    this.removeClip(clip, true);
                })
                this.defaultClip = null;
            }
        }
    }

    @property
    loop: boolean = false;

    @property({
        type: CCBoolean,
        visible() {
            return this._spine;
        }
    })
    public get playInEditor(): boolean {
        if (EDITOR) {
            const currentMode: string = Editor.EditMode.getMode();
            if (currentMode == EditorMode.Animation) {
                this._isRunning = true
            }
        }
        return this._isRunning;
    }

    public set playInEditor(value: boolean) {
        if (EDITOR) {
            if (value) {
                this.playAnimation();
            } else if (!value && SpineStatePreviewer.__runningPreviewerUuid == this.uuid) {

                const checkMode: string = Editor.EditMode.getMode();
                this.spineState && this.spineState.cancel();
                if (checkMode == EditorMode.Animation) {
                    // 
                    const currentClip: AnimationClip = this.clips[0];
                    if (currentClip) {
                        Editor.Message.request('scene', 'change-clip-state', 'stop', currentClip.uuid);
                    }
                    Editor.Message.request('scene', "close-scene")
                    SpineStatePreviewer.__runningPreviewerUuid = null;
                }
            } else {
                return;
            }
        }
        this._isRunning = value;
    }

    @property({
        override: true,
        visible: false
    })
    playOnLoad: boolean;

    @property({
        type: AnimationClip,
        visible: false,
        override: true
    })
    get defaultClip(): AnimationClip {
        return this._defaultClip
    }
    set defaultClip(value: AnimationClip) {
        this._defaultClip = value;
    }

    @property({
        type: [AnimationClip],
        visible: false,
        override: true
    })
    get clips(): AnimationClip[] {
        return this._clips
    }
    set clips(values: AnimationClip[]) {
        this._clips = values
    }

    async onLoad(): Promise<void> {
        if (!this.spine) {
            // const components:Component[] = this.getComponents(Component);
            // let nearState:SpineState|null = null;
            // components.find((comp:Component)=>{
            //     if(comp instanceof SpineState){
            //         nearState = comp;
            //     }
            //     return comp  == this;
            // });

            const stateLeader: SpineState = this.getComponent(SpineState)
            if (stateLeader) {
                this._spineState = stateLeader;
                this.spine = stateLeader.spine;

                // change spine when state is running
                this.node.on(SpineState.BlockEvent.START, (options: SpineStateOption) => {
                    if (options?.spine) {
                        this.spine = options.spine;
                    }
                }, this)
            }
            if (!this.spine) {
                this.spine = this.getComponent(sp.Skeleton) || this.getComponentInChildren(sp.Skeleton);
            }
        }

    }

    onDestroy(): void {
        if (this._spineState) {
            this.node.off(SpineState.BlockEvent.START);
        }
        super.onDestroy && super.onDestroy()
    }

    private async referenceAnimationAsset(targetAssetUuid: string): Promise<void> {
        if (EDITOR) {
            const uuid: string = targetAssetUuid
            const url: string = await Editor.Message.request('asset-db', "query-url", uuid);
            const relativePath: string = strings.getPathWithoutFileName(url);
            const animAssetName: string = strings.getFilenameWithoutExtension(url);
            const animAssetUrl: string = relativePath + animAssetName + '.anim';
            // 
            let isNewAsset: boolean = false;
            let assetInfo: AssetInfo = await Editor.Message.request('asset-db', 'query-asset-info', animAssetUrl);
            if (!assetInfo) {
                assetInfo = await Editor.Message.request('asset-db', 'create-asset', animAssetUrl, JSON.stringify(DefaultAnimationClipData));

                await Editor.Message.request('asset-db', 'refresh-asset', assetInfo.uuid);
                isNewAsset = true;
            }
            // const animationAssetUuid:string = assetInfo.uuid;

            const animationClip: AnimationClip = await this.loadAnimationClipByUuid(assetInfo.uuid);
            if (animationClip) {
                this.addClip(animationClip, assetInfo.name);
                this.defaultClip = animationClip;
                isNewAsset && await Editor.Message.request('scene', 'soft-reload');
            }
        }
    }


    private async playAnimation() {
        if (EDITOR) {

            const currentClip: AnimationClip = this.clips[0];
            const selectedNodeUuid: string = this.node.uuid// this.spine?.node.uuid;
            // const sceneUUID:string = await Editor.Message.request('scene', 'query-current-scene');
            await Editor.Message.request('scene', 'record-animation', selectedNodeUuid, true, currentClip.uuid);
            SpineStatePreviewer.__runningPreviewerUuid = this.uuid;
            // await Editor.Message.request('scene', 'record-animation', selectedNodeUuid, true, ...clips);
            await Editor.Message.request('scene', 'query-node', selectedNodeUuid);

            // await Editor.Message.request('scene', 'staging', {
            //     assetUuid: sceneUUID,    // prefab  UUID
            //     // animationUuid: firstUUid,
            // });
            // Editor.Message.send('scene', EditorSendMessage.Switch_Animation_Mode);
            // await Editor.Message.request('scene', EditorRequestMessage.Unstaging)
            // const currentClip:AnimationClip = this.clips[0]
            if (currentClip) {
                // await Editor.Message.request('scene', 'change-clip-state', 'play', currentClip.uuid);
                if (this.spineState) {
                    // Editor.Message.request('scene', 'change-clip-state', 'play', currentClip.uuid);
                    // await this.spineState.execute();
                    await this.excuteSpineState();
                    // BlockUtils.compineAnimation(this.spine, this.spineState.state, false);
                    log('SpineState executed from SpinePreviewer')
                    this.playInEditor = false;
                }
            }
        }
    }

    private async excuteSpineState() {
        if (this.spineState) {
            await this.spineState.execute();
            if (this.playInEditor && this.loop) {
                await this.excuteSpineState();
            }
        }
    }


    /**
     * Update skeleton animation.
     * @param dt delta time.
     */
    public updateSpineAnimation(dt: number): void {
        if (!this.spine) return;
        const spine: SpSkeletonType = this.spine as SpSkeletonType;
        spine.markForUpdateRenderData();
        if (spine.paused) return;
        dt *= spine.timeScale * 1;
        // if (spine.isAnimationCached()) {
        if (spine._cacheMode !== sp.Skeleton.AnimationCacheMode.REALTIME) {
            if (spine._isAniComplete) {
                if (spine._animationQueue.length === 0 && !spine._headAniInfo) {
                    const frameCache = spine._animCache;
                    if (frameCache && frameCache.isInvalid()) {
                        frameCache.updateToFrame(0);
                        const frames = frameCache.frames;
                        spine._curFrame = frames[frames.length - 1];
                    }
                    return;
                }
                if (!spine._headAniInfo) {
                    spine._headAniInfo = spine._animationQueue.shift()!;
                }
                spine._accTime += dt;
                if (spine._accTime > spine._headAniInfo?.delay) {
                    const aniInfo = spine._headAniInfo;
                    spine._headAniInfo = null;
                    spine.setAnimation(0, aniInfo?.animationName, aniInfo?.loop);
                }
                return;
            }
            spine._updateCache(dt);
        } else {
            spine._instance! && spine._instance!.updateAnimation(dt);
        }
    }

    /**
     * 
     * @param uuid 
     * @returns 
     */
    private async loadAnimationClipByUuid(uuid: string): Promise<AnimationClip | null> {
        return new Promise<AnimationClip | null>((resolve, reject) => {
            assetManager.loadAny({ uuid: uuid }, (err, asset) => {
                if (err) {
                    console.error('Failed to load asset:', err);
                    resolve(null);
                    return;
                }
                resolve(asset as AnimationClip);
            });
        })
    }


    update(deltaTime: number) {
        if (this.playInEditor && SpineStatePreviewer.__runningPreviewerUuid == this.uuid) {
            this.updateSpineAnimation(deltaTime);
            // SkeletonSystem
            // director.getSystem('SKELETON').postUpdate(deltaTime)
            TweenSystem.instance.ActionManager.update(deltaTime);
            Editor.Message.request('scene', 'set-edit-time', deltaTime)
        }
    }
}


