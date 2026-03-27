import { _decorator, Constructor, Enum, errorID, js, log, Node, sp, Tween, tween } from 'cc';


import { EDITOR } from 'cc/env';
import { ISpineView } from '../widgets/spines/SpineType';
import { cocoseus_cceditor } from '../definition/cocoseus.cceditor';
import { cocoseus_classify } from '../definition/cocoseus.classify';

const { property } = _decorator;
const { CCClassify } = cocoseus_classify;
const CCEditor = cocoseus_cceditor

// const { CCClassify, CCEditor } = cocoseus
// const {tween} = CocoTween;

export const SpineViewClassName:string = "SpineView";
/**
 * 
 */
export default CCClassify<ISpineView>(function spineViewify<TBase>(base:Constructor<TBase>):Constructor<TBase & ISpineView>{
    let DefaultSkinsEnum = Enum({ 'default': -1 });
    let DefaultAnimsEnum = Enum({ '<None>': 0 });
    // 
    class SpineViewified extends (base as unknown as Constructor<any>)implements ISpineView{
        private _defaultOption:{
            skin?:string,
            animation:string,
            loop:boolean,
            active:boolean
        } = Object.create(null);
        private _editable: boolean = false;
        public _activeLoop:boolean = false;
        // protected _runningAnimations:Set<string> = new Set();

        @property({serializable:true})
        private _duration: number = 0;

        @property({serializable:true})
        private _repeatTime: number = 1;
        
        
        protected _resolve:Function = null;
        protected _reject:Function = null;

        @property({ serializable: true, visible: false })
        private _spine: sp.Skeleton | null = null;

        @property({ type: sp.Skeleton })
        public get spine(): sp.Skeleton | null {
            return this._spine;
        }
        public set spine(value: sp.Skeleton | null) {
            this._spine = value;
            if(EDITOR){
                this.updateEnumInspector();
                this.updateSpineInformation();
            }
        }

        @property({
            // serializable: false,
            visible() {
                return this._hasSpineReference();
            }
        })
        protected get editable(): boolean {
            return this._editable;
        }
        protected set editable(value: boolean) {
            this._editable = value;
            if(EDITOR && value){
                this.updateEnumInspector();
                this.updateSpineInformation();
            }
        }

        @property({
            readonly:true,
            serializable: true,
            visible(){
                return this._hasSpineReference() && !this.editable;
            }
        })
        public animation:string = '';

        @property({
            readonly:true,
            serializable: true,
            visible(){
                return this._hasSpineReference() && !this.editable;
            }
        })
        public defaultSkin:string = '';

        @property({
            type: DefaultAnimsEnum,
            visible() {
                return this._hasSpineReference() && this.editable;
            },
            displayName: 'Animation'
        })
        protected get animationIndex(): number {
            const animationName:string = this.animation;
            if (this.editable && this.spine && this.spine.skeletonData && animationName.length ) {
                const animsEnum:{[key: string]: number} = this.spine.skeletonData.getAnimsEnum();
                if (animsEnum) {
                    const animIndex:number = animsEnum[animationName];
                    if (animIndex !== undefined) {
                        return animIndex;
                    }
                }
            }
            return 0;
        }
        protected set animationIndex(value: number) {
            if(!this.editable){
                return
            }
            if (value === 0) {
                this.animation = '';
                return;
            }
            let animsEnum:{[key: string|number]: number|string} | undefined = undefined;
            if (this.spine && this.spine.skeletonData) {
                animsEnum = this.spine.skeletonData.getAnimsEnum();
            }
            if ( !animsEnum ) {
                errorID(7502, js.getClassName(this));
            }
            let animName:string = animsEnum[value] as string;
            if (!!animName) {
                this.animation = animName;
            } else {
                errorID(7503, js.getClassName(this));
            }
            this.updateSpineInformation();
        }

        @property({
            type: DefaultSkinsEnum,
            serializable: true,
            visible() {
                return this._hasSpineReference() && this.editable;
            },
            displayName: 'Default Skin'
        })
        protected get defaultSkinIndex(): number {
            const skinName:string = this.defaultSkin;
            if (this.editable && this.spine && this.spine.skeletonData && skinName.length ) {
                const skinsEnum:{[key: string]: number} = this.spine.skeletonData.getSkinsEnum();
                if (skinsEnum) {
                    const skinIndex:number = skinsEnum[skinName];
                    if (skinIndex !== undefined) {
                        return skinIndex;
                    }
                }
            }
            return 0;
        }   

        protected set defaultSkinIndex(value: number) {
            if(!this.editable){
                return
            }
            let skinsEnum;
            if (this.spine && this.spine.skeletonData) {
                skinsEnum = this.spine.skeletonData.getSkinsEnum();
            }else{
                this.defaultSkin = this.defaultSkin  || '';
                return;
            }
            if ( !skinsEnum ) {
                errorID(7502,js.getClassName(this));
            }
            var skinName = skinsEnum[value];
            if (!!skinName) {
                this.defaultSkin = skinName;
            } else {
                errorID(7501, js.getClassName(this));
            }
            this.updateSpineInformation();
        }

        @property({serializable:true})
        private _loop: boolean = false;

        public activeLoop(value:boolean){
            this._activeLoop = value;
        }
        
        /**
         * @description
         * Get the duration of the current animation.
         * If the animation is not set or the spine data is not available, it returns 0.
         */
        @property({
            visible() {
                return this._hasSpineReference();
            }
        })
        get duration(): number {
            if(!this._duration){
                this.updateSpineInformation();
            }
            return this._duration;
        }

        
        @property({
            range: [1, 100, 1],
            displayName:"Repeat"
        })
        public get repeatTime(): number {
            return this._repeatTime;
        }
        public set repeatTime(value: number) {
            this._repeatTime = value;
            this.updateSpineInformation(true);
            this._duration = this._duration*value
        }

        @property({
            // serializable: false,
            visible() {
                return this._activeLoop;
            }
        })
        protected get loop(): boolean {
            return this._activeLoop && this._loop;
        }
        protected set loop(value: boolean) {
            this._loop = value;
        }

        private _restoreActive:()=>void = null;

        set active(value:boolean){
            if(this.spine){
                if(this._restoreActive){
                    this._restoreActive();
                    this._restoreActive = null;
                }
                if(value){
                    this._restoreActive = this._activeNodeInHierarchy(this.spine.node);
                }
            }
        }

        get active():boolean{
            return !!this._restoreActive
        }

        getAnimation():string{
            return this.animation
        }

        getSkin():string{
            return this.defaultSkin
        }

        /**
         * @description
         * Lifecycle method called when the component is loaded.
         * It checks if the spine reference is valid and updates the enum properties for the inspector.
         * If the spine reference is not valid, it logs an error.
         */
        onLoad() {
            super.onLoad && super.onLoad();
            // check if spine reference is valid
            if (this._hasSpineReference()) {
                this.updateEnumInspector();
            } else {
                errorID(7500, js.getClassName(this));
            }
            if(this.spine){
                this._defaultOption.animation = this.spine.animation;
                this._defaultOption.loop = this.spine.loop;
                this._defaultOption.active = this.spine.node.active;
            }
        }

        protected onDestroy(): void {
            if(this.spine){
                this.spine.setCompleteListener(null);
            }
            super.onDestroy && super.onDestroy();
        }

        /**
         * 
         * 
         * @param forceDuration 
         * @returns 
         */
        async play(forceDuration:number = this.duration): Promise<string> {
            if (!this.spine || !this.spine.skeletonData) {
                errorID(7504, js.getClassName(this));
                return;
            }
            // 
            this.skip();
            // 
            if (!this.spine['defaultSkin'] || this.spine['defaultSkin'] !== this.defaultSkin) {
                this.spine.setSkin(this.defaultSkin);
            }
            // 
            if (this.animation && this.animation.length > 0) {
                // 
                if(forceDuration !== this.duration){
                    await this.loopInTime(forceDuration);
                }else if(this.loop){
                    await this.loopInTime(this.duration);
                }else{
                    await this.playDependOnDuration(this.duration);
                    // 
                    
                }
                // this.spine.node.active = lastActive;
                
            } else {
                errorID(7505, js.getClassName(this));
            }
            return this.animation;
        }


        /**
         * 
         * @param duration 
         * @returns 
         */
        async playDependOnDuration(duration:number = this.duration):Promise<string>{
            if (!this.spine || !this.spine.skeletonData) {
                errorID(7504, js.getClassName(this));
                return;
            }

            if (!this.spine['defaultSkin'] || this.spine['defaultSkin'] !== this.defaultSkin) {
                this.spine.setSkin(this.defaultSkin);
            }
            // check if animation is set
            if (this.animation && this.animation.length > 0) {
                const lastAnimation:string = this.spine.animation;
                const isLoop:boolean = this.spine.loop;
                log(' |__ Start loop anim: '+ this.animation + ' -duration: ' + this.duration)
                
                this.spine.setAnimation(0, this.animation, true);
                if(duration){
                    // Add complete handler for _spine
                    await new Promise<void>((resolve:Function, reject:Function) => {
                        const currentTween:Tween<Node> = tween(this.spine.node);
                        
                        this._resolve = ()=>{
                            currentTween.stop();
                            // this.spine.clearAnimation();
                            // this.spine.clearTrack(0)
                            this.spine.setAnimation(0, lastAnimation, isLoop);
                            resolve();
                        };
                        this._reject = ()=>{
                            currentTween.stop();
                            // this.spine.clearAnimation() 
                            // this.spine.clearTrack(0)
                            reject();
                        }
                        currentTween.delay(duration)
                            .call(this.skip.bind(this)).start();
                    });
                    // 
                }
            }else{
                errorID(7505, js.getClassName(this));
            }
            return this.animation;
        }

        async playDependOnAnimationTime(forceDuration:number = this.duration):Promise<string>{
            const lastAnimation:string = this.spine.animation;
            const isLoop:boolean = this.spine.loop;
            this.spine.loop = false;
            // const restoreActiveFunc:()=>void = this._activeNodeBranch(this.spine.node);
            log(' |__ Start unloop anim: '+ this.animation + ' -duration: ' + this.duration)
            // this.spine.clearAnimation();
            this.spine.setAnimation(0, this.animation, false);
            // 
            if(forceDuration){
                // this._runningAnimations.add(this.animation);
                const trackCompletedAnimation:string = this.animation;
                // Add complete handler for _spine
                await new Promise<void>((resolve:Function, reject:Function) => {
                    // 
                    // 
                    this._resolve = ()=>{
                        // this.spine.clearAnimation();
                        resolve();
                    };
                    this._reject = ()=>{
                        // this.spine.clearAnimation();
                        reject()
                    }
                    // this.spine.setCompleteListener(this._onAnimationCompleted.bind(this))
                    this.spine.setStartListener((x:sp.spine.TrackEntry)=>{
                        this.active = true;
                    })
                    this.spine.setCompleteListener((trackEntry: sp.spine.TrackEntry)=>{
                        const animationName:string = trackEntry?.animation?.name;
                        if(animationName == trackCompletedAnimation){
                            this.skip();
                        }
                    })
                    // 
                });
            }
            
            this.spine.loop = isLoop;
            if(isLoop && lastAnimation){
                this.spine.setAnimation(0, lastAnimation, isLoop);
            }else{
                // this.spine.clearTrack(0);
            }
            return this.animation;
        }
        /**
         * 
         * @param duration 
         */
        async loopInTime(duration:number):Promise<string>{
            if (!this.spine || !this.spine.skeletonData) {
                errorID(7504, js.getClassName(this));
                return;
            }
            // set skin if available
            if (!this.spine['defaultSkin'] || this.spine['defaultSkin'] !== this.defaultSkin) {
                this.spine.setSkin(this.defaultSkin);
            }
            // check if animation is set
            if (this.animation && this.animation.length > 0) {
                const lastAnimation:string = this.spine.animation;
                const isLoop:boolean = this.spine.loop;
                log(' |__ Start loop anim: '+ this.animation + ' -duration: ' + this.duration)
                this.spine.setAnimation(0, this.animation, true);
                if(duration){
                    // Add complete handler for _spine
                    await new Promise<void>((resolve:Function, reject:Function) => {
                        const currentTween:Tween<Node> = tween(this.spine.node);
                        
                        this._resolve = ()=>{
                            currentTween.stop();
                            // this.spine.clearAnimation();
                            // this.spine.clearTrack(0)
                            resolve();
                        };
                        this._reject = ()=>{
                            currentTween.stop();
                            // this.spine.clearAnimation() 
                            // this.spine.clearTrack(0)
                            reject();
                        }
                        currentTween.delay(duration)
                            .call(this.skip.bind(this)).start();
                    });
                    // 
                }
                // this.spine.clearTrack(0);

                // this.spine.loop = isLoop;
                // this.spine.setAnimation(0, lastAnimation, isLoop);
            } else {
                errorID(7505, js.getClassName(this));
            }
            return this.animation;
        }

        public stop(){
            if(this._reject){
                this.skip();
                
                if(this.spine){
                    // if(this._defaultOption.animation){
                    //     this.spine.setAnimation(0, this._defaultOption.animation, !!this._defaultOption.loop)
                    // }
                    // this.spine.node.active = !!this._defaultOption.active;
                }
                this.active = false;
                // if(this._reject){
                //     this._reject();
                //     this._reject = null;
                // }
            }
        }

        public skip(){
            if(this._resolve){
                this._resolve();
                this._resolve = null;
            }
        }

        /**
         * @description 
         * Update the enum properties for the inspector.
         * This method is called when the spine reference is set or changed.
         * It updates the animation and skin enums for the editor.
         */
        protected updateEnumInspector() {
            if(this.editable){
                // update animation list for editor
                this.updateAnimEnum();
                // update skin list for editor
                this.updateSkinEnum();
            }
        }

        /**
         * 
         */
        protected updateSpineInformation(forceUpdate:boolean = false) {
            if(this.editable || forceUpdate){
                // if (this._hasSpineReference()) {
                //     // update animation and skin enums
                // }
                if (this.spine && this.spine.skeletonData && this.animation && this.animation.length) {
                    const animation:sp.spine.Animation = this.spine.skeletonData.getRuntimeData().animations.find((anim: sp.spine.Animation) => {
                        return anim.name === this.animation;
                    });
                    // set animation duration
                    this._duration = animation ? animation?.duration : 0;
                }else{
                    this._duration = 0;
                }
            }
        }

        // protected _onAnimationCompleted(trackEntry: sp.spine.TrackEntry){
        //     const animationName:string = trackEntry?.animation?.name;
        //     if(animationName && this._runningAnimations.has(animationName)){
        //         this._runningAnimations.delete(animationName);
        //         this.skip();
        //     }
        // }

        /**
         * 
         * @returns 
         */
        protected _hasSpineReference():boolean{
            return this._spine && this._spine.skeletonData && this._spine.skeletonData.getAnimsEnum() !== undefined 
        }

        /**
         * @description
         * Update the animation enum for the inspector.
         * This method is called when the spine reference is set or changed.
         * It updates the animation enum for the editor.
         */
        protected updateAnimEnum() {
            let animEnum:{[key: string]: number;} | undefined = undefined;
            if (this._spine && this._spine.skeletonData) {
                // animEnum = Object.assign({}, this._spine.skeletonData.getAnimsEnum());
                animEnum = this._spine.skeletonData.getAnimsEnum();
            }
            // change enum
            CCEditor.enumifyProperty(this.constructor, 'animationIndex', animEnum || DefaultAnimsEnum);
            this.animationIndex = !!this.animationIndex ? this.animationIndex : 0;
        }

        /**
         * @description
         * Update the skin enum for the inspector.
         * This method is called when the spine reference is set or changed.
         * It updates the skin enum for the editor.
         * 
         */
        protected updateSkinEnum() {
            let skinEnum:{[key: string]: number;} | undefined = undefined;
            if (this._spine && this._spine.skeletonData) {
                // skinEnum = Object.assign({}, this._spine.skeletonData.getSkinsEnum());
                skinEnum = this._spine.skeletonData.getSkinsEnum();
            }
            // change enum
            CCEditor.enumifyProperty(this.constructor, 'defaultSkinIndex', skinEnum  || DefaultSkinsEnum );
            this.defaultSkinIndex = !!this.defaultSkinIndex ? this.defaultSkinIndex : 0;
        }

        // /**
        //  * Search upwards to parent nodes to ensure the animation is displayed.
        //  * By activating all nodes in the branch of the spine node.
        //  * Returns a function that, when called, will restore the original state of the nodes before displaying the animation.
        //  * @param {*} node 
        //  * @param {*} deactiveList 
        //  * @returns {function} Returns a function that, when called, will restore the nodes that were activated.
        //  */
        private _activeNodeInHierarchy(node:Node, deactiveList?:Node[]):()=>void|null{
            if(node && node.parent){
                deactiveList = deactiveList || [];
                if(node.active == false){
                    deactiveList.push(node);
                    node.active = true;
                }
                return this._activeNodeInHierarchy(node.parent, deactiveList)
            }else if(deactiveList && deactiveList.length){
                const restoreActivedNodes:Node[] = deactiveList;
                return ()=>{
                    restoreActivedNodes.forEach((node:Node)=>{
                        node.active = false;
                    })
                    restoreActivedNodes.length = 0;
                }
                
            }
            return null
        }

        

    }
    return SpineViewified as unknown as Constructor<TBase & ISpineView>;
}, SpineViewClassName)
