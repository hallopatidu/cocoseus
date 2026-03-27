import { __private, _decorator, CCBoolean, Component, error, EventHandler, js, Node, sp, tween, Tween } from 'cc';

import { EDITOR } from 'cc/env';
import { cocoseus } from '../../definition/cocoseus';
import { PipelinePlayer } from '../pipelines/PipelinePlayer';
import { ISpineView, SpineStateOption, SpineStatus, SpSkeletonType } from './SpineType';
import { IPipelinePlayer, PipelineStatus } from '../pipelines/PipelineType';



const { ccclass, property, executeInEditMode, menu } = _decorator;

const IncreaseTotalDuration = Symbol();
const WaitStateDone = Symbol();
const UpdateAnimation = Symbol();

@ccclass('SpineStateElement')
@cocoseus.spineViewify
export class SpineStateElement implements ISpineView {
    get repeatTime(): number {
        throw new Error('Method not implemented.');
    }
    skip(): void {
        throw new Error('Method not implemented.');
    }
    getAnimation(): string {
        throw new Error('Method not implemented.');
    }
    getSkin(): string {
        throw new Error('Method not implemented.');
    }
    get active(): boolean {
        throw new Error('Method not implemented.');
    }
    set active(value: boolean) {
        throw new Error('Method not implemented.');
    }
    activeLoop(value: boolean): void {
        throw new Error('Method not implemented.');
    }
    stop(): void {
        throw new Error('Method not implemented.');
    }
    loopInTime(duration: number): Promise<string> {
        throw new Error('Method not implemented.');
    }
    play(duration?: number): Promise<string> {
        throw new Error('Method not implemented.');
    }
    get duration(): number {
        throw new Error('Method not implemented.');
    }
    get spine(): sp.Skeleton {
        throw new Error('Method not implemented.');
    }

    set spine(value: sp.Skeleton | null) {
        throw new Error('Method not implemented.');
    }
}

@ccclass('SpineState')
@menu('Animation Assistance/SpineState')
@executeInEditMode(true)
export class SpineState extends PipelinePlayer implements IPipelinePlayer {
    @property({ serializable: true, visible: false })
    private _spine: sp.Skeleton | null = null;

        
    @property({ type: sp.Skeleton })
    public get spine(): sp.Skeleton | null {
        return this._spine;
    }
    public set spine(value: sp.Skeleton | null) {
        this._spine = value;
        if(EDITOR){
            this.updateSpineElementStates()
        }
    }

    
    @property({
        // group: 'SETTINGS',
        visible() {
            return this.isHeader;
        },
        displayName: 'Total Duration',
        readonly: true
    })
    public get totalDuration(): number {
        return this._totalDuration;
    }

    public set totalDuration(value: number) {
        this._totalDuration = value;
    }

    @property({
        // visible() {
        //     return !this.isHeader;
        // },
        displayName: 'Block Duration',
        readonly: true
    })
    public get originDuration(): number {
        return this._originDuration;
    }

    public set originDuration(value: number) {
        this._originDuration = value;
    }

    // @property({
    //     // group: 'SETTINGS',
    //     displayName: 'Force Duration',
    // })
    // public get forceDuration(): number {
    //     if(!this._forceDuration ){
    //         this._forceDuration = this._originDuration;
    //     }
    //     return this._forceDuration;
    // }

    // public set forceDuration(value:number){
    //     this._forceDuration = value;
    //     this.calculateDuration();
    // }

    protected _isFooter: boolean = false;

    protected get isFooter(): boolean {
        return this._isFooter;
    };

    protected set isFooter(value: boolean) {
        this._isFooter = value;
    }


    @property({ serializable: true, visible: false })
    private _state: SpineStateElement[] = [];
 
    @property({ serializable: true, visible: false })
    private _originDuration: number = 0;

    @property({ serializable: true, visible: false })
    private _forceDuration: number = 0;

    @property({ serializable: true, visible: false })
    private _totalDuration: number = 0;

    @property({
        type: [SpineStateElement],
        group: "STATEs",
    })
    public get state(): SpineStateElement[] {
        return this._state;
    }
    public set state(value: SpineStateElement[]) {
        this._state = value;
        this.updateSpineElementStates();
    }

    @property({
        type: [EventHandler],
        group: "EVENTs",
        override:true,
        visible:true
    })
    onStartMethods: EventHandler[] = [];

    @property({
        type: [EventHandler],
        group: "EVENTs",
        override:true,
        visible:true
    })
    onEndMethods: EventHandler[] = [];

    @property({
        type: [EventHandler],
        group: "EVENTs",
        override:true,
        visible:true
    })
    onCancelMethods: EventHandler[] = [];    

    public get duration(): number {
        return this.originDuration;
    }

    protected _currentState: SpineStateElement[] = [];
    private _waitStateDone: Function | null = null;    
    protected options: SpineStateOption = { status: PipelineStatus.INIT };

    [IncreaseTotalDuration](duration: number) {
        this._totalDuration += duration
    }

    // public onLoad() {
    //     // this._initMethods();
    //     super.onLoad();
    //     this.updateSpineElementStates();
    // }

    /**
     * override (new ChainBlock())._initChainBlocks
     * Initializes the methods for each SpineState in the block.
     * It sets the duration of the block based on the sum of durations of all SpineStates
     * and adds an execution method for each state to the block's execution queue.
     * Calculates the total duration of all Spine states in the block.
     * 
     */
    protected override _initChainBlocks(): void {
        super._initChainBlocks();
        this.updateSpineElementStates();
        this.calculateDuration();
    }

    public cancel(): void {
        super.cancel();
        this[WaitStateDone](true);
    }


    protected override onInit(options: any): void {
        super.onInit(options)
        this.add(this.executeBlockStates.bind(this), this.options)
    }

    /**
     * 
     * @param options 
     */
    protected async onStartBlock(options: any) {
        // this.activeNodeInHierarchy(this.spine.node)
        this.options.spine = this.spine;
        await super.onStartBlock(options);
        await this.callAllEventHandlers(this.onStartMethods, options);
    }


    /**
     * 
     * @param options 
     */
    protected async onEndBlock(options: any) {
        this._currentState = [];
        await this.callAllEventHandlers(this.onEndMethods, options);
        await super.onEndBlock(options);
    }


    protected async onCancelBlock(options: any) {
        await this.callAllEventHandlers(this.onCancelMethods, this.options);
        this._currentState = [];
        await super.onCancelBlock(options);
    }
    

    /**
     * Initializes the methods for each SpineState in the block.
     * It sets the duration of the block based on the sum of durations of all SpineStates
     * and adds an execution method for each state to the block's execution queue.
     * Calculates the total duration of all Spine states in the block.
     * 
     */
    // protected _initMethods() {
    //     this._originDuration = 0;
    //     //
    //     this.add(this.onStartBlock.bind(this), this.options);
    //     this.add(this.executeAllStates.bind(this), this.options);
    //     this.add(this.onEndBlock.bind(this), this.options);
    // }

    /**
     * 
     */
    protected updateSpineElementStates(){
        this.state.forEach((state: SpineStateElement) => {
            state.spine = this.spine;
        });
        
    }

    /**
     * If the block is a header, Recalculates the total duration of all Spine states in the block., 
     * it sums up the durations of all SpineBlock components attached to the node, including itself.
     */
    protected calculateDuration() {
        if (EDITOR) {
            this.originDuration = 0;
            this.state.forEach((state: SpineStateElement) => {
                this.originDuration = this.originDuration + state.duration;
            })
            // Update total durations
            const components: SpineState[] = this.node.getComponents<SpineState>(SpineState as unknown as any) as SpineState[];  // type: [OrderComponent];
            if (components && components.length > 0) {
                const leader: SpineState = components[0];
                leader.totalDuration = 0;
                components.forEach((component: SpineState) => {
                    leader[IncreaseTotalDuration](component.duration);
                })
            }
            // 
        }
    }


    
    /**
     * 
     * @param isLoopEnd 
     * @returns 
     */
    protected runCompinedAnimation(isLoopEnd: boolean = false): string | void {
        if (!this.spine || this.state.length == 0) {
            return;
        }
        const lastAnimIndex: number = this.state.length - 1;
        let lastAnim: string = (this.state[0] as SpineStateElement).getAnimation();
        this.state.forEach((state: SpineStateElement, index: number) => {
            const animName: string = state.getAnimation();
            const defaultRepeat: number = state.repeatTime || 1;
            let repeatTime: number = defaultRepeat;
            while (repeatTime) {
                if (index == 0 && (repeatTime == defaultRepeat)) {
                    lastAnim = animName;
                    this.spine.setAnimation(0, animName, false);
                } else if (index == lastAnimIndex) {
                    if (!isLoopEnd) {
                        lastAnim = animName;
                    }
                    this.spine.addAnimation(0, animName, isLoopEnd);
                    // 
                    // this.spine.setCompleteListener((track:sp.spine.TrackEntry)=>{
                    //     if(track.animation == )
                    // })
                    // 

                } else {
                    lastAnim = animName;
                    this.spine.addAnimation(0, animName, false);
                }
                repeatTime--;
            }
        });
        return lastAnim
    }

    /**
     * 
     * Executes the given SpineState.
     * @param state 
     * @param options 
     * @returns 
     */
    protected async executeBlockStates(options?: any): Promise<void> {
        await new Promise<void>((resolve: Function, reject: Function) => {
            this.runCompinedAnimation()
            const currentTween: Tween<Node> = tween(this.spine.node);
            this._waitStateDone = async (isCancelled: boolean = false) => {
                currentTween.stop();
                if (isCancelled) {
                    reject();
                } else {
                    resolve()
                }
            };
            currentTween.delay(this.duration)
                .call(this[WaitStateDone].bind(this, false, options)).start();
        });
    }


    

    /**
     * 
     */
    private async [WaitStateDone](isCancelled: boolean = false, options?: any) {
        if (this._waitStateDone) {
            const waitDone: Function = this._waitStateDone;
            this._waitStateDone = null;
            waitDone(isCancelled);
            if (isCancelled) {
                await this.onCancelBlock(options);
            }
        }
    }

    /**
     * Update skeleton animation.
     * @param dt delta time.
     */
    public [UpdateAnimation] (dt: number): void {
        if(!this.spine) return;
        const spine:SpSkeletonType = this.spine as SpSkeletonType;
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

}


