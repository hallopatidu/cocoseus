import { __private, _decorator, Component, Constructor, EventHandler, js, Node } from 'cc';


import PipelineChain from './PipelineChain';
import { PipelineStatus, IPipelinePlayer } from './PipelineType';
import { cocoseus } from '../../definition/cocoseus';
// import { NodeBranchActivify } from '../../cocoseus/polyfill/NodeHierarchyActivify';
// import { FunctionUtils } from '../core/utils';
const { ccclass, property } = _decorator;

const RestoreActivedNodeHandler = Symbol();



@ccclass('PipelinePlayer')
export class PipelinePlayer extends PipelineChain implements IPipelinePlayer { 

    static BlockEvent = Object.assign( {
        START: 'block_start',
        END: 'block_end',
    }, PipelineChain.BlockEvent);

    static BlockStatus = {
        INIT:0,
        START:0,
        END:0,
    }

    private [RestoreActivedNodeHandler]: () => void | null;
    protected options: { status: PipelineStatus } = { status: PipelineStatus.INIT };

    
    protected override _initChainBlocks(): void {
        this.add(this.onStartBlock.bind(this), this.options);
        this.onInit(this.options);
        this.add(this.onEndBlock.bind(this), this.options);
        super._initChainBlocks()
    }

    get totalDuration(): number {
        throw new Error('Method not implemented.');
    }


    protected onInit(options:any):void{

    }

    /**
     * 
     * @param options 
     */
    protected async onStartBlock(options:any){
        this.options.status = PipelineStatus.START
        this.node.emit(PipelinePlayer.BlockEvent.START, options)
        this.activeNodeInHierarchy(this.node)
    }


    /**
     * 
     * @param options 
     */
    protected async onEndBlock(options:any){
        this.options.status = PipelineStatus.END
        this.deactiveNodeInHierarchy();
        this.node.emit(PipelinePlayer.BlockEvent.END)
        
    }

    /**
     * 
     * @param options 
     */
    protected async onCancelBlock(options:any){
        this.deactiveNodeInHierarchy();
    }

    /**
     * 
     * @param eventHandlers 
     * @param options 
     */
    protected async callAllEventHandlers(eventHandlers:EventHandler[], options?:any){
        await Promise.all(eventHandlers.reduce((promises:Promise<any>[], eventHandler:EventHandler)=>{
            promises.push(cocoseus.utils.functions.asyncCall(this._getMethodFromEventHandler(eventHandler)))
            return promises
        }, []));
        // eventHandlers.forEach((eventHandler:EventHandler)=>this._callEventHandler(eventHandler, options));
    }

    /**
     * Search upwards to parent nodes to ensure the animation is displayed.
     * By activating all nodes in the hierarchy of the node.
     * Returns a function that, when called, will restore the original state of the nodes before displaying the animation.
     * @param {*} node 
     * @param {*} deactiveList 
     * @returns {function} Returns a function that, when called, will restore the nodes that were activated.
     */
    protected activeNodeInHierarchy(node:Node, deactiveList?:Node[]):()=>void|null{
        if(node && node.parent){
            deactiveList = deactiveList || [];
            if(node.active == false){
                deactiveList.push(node);
                node.active = true;
            }
            return this.activeNodeInHierarchy(node.parent, deactiveList)
        }else if(deactiveList && deactiveList.length){
            const restoreActivedNodes:Node[] = deactiveList;
            this[RestoreActivedNodeHandler] = ()=>{
                restoreActivedNodes.forEach((node:Node)=>{
                    node.active = false;
                })
                restoreActivedNodes.length = 0;
            }
            return this[RestoreActivedNodeHandler]
        }
        return null
    }
    
    /**
     * 
     */
    protected deactiveNodeInHierarchy(){
        if(this[RestoreActivedNodeHandler]){
            this[RestoreActivedNodeHandler]()
            this[RestoreActivedNodeHandler] = null;
        }
    }

    
    /**
     * 
     * @param eventHandler 
     * @returns 
     */
    protected _getMethodFromEventHandler(eventHandler:EventHandler):Function | null {
        if (eventHandler && eventHandler instanceof EventHandler) {
            const comp:Component|null = this._getComponentFromEventHandler(eventHandler)!;
            if(!comp) {
                return null; 
            }
            const handler:Function = comp![eventHandler.handler];
            if (!handler || typeof (handler) !== 'function') {
                return null; 
            }
            return handler.bind(comp, eventHandler?.customEventData);
        }
    }

    /**
     * 
     * @param eventHandler 
     * @returns 
     */
    protected _getComponentFromEventHandler(eventHandler:EventHandler):Component | null {
        if (eventHandler && eventHandler instanceof EventHandler) {
            const target:Node = eventHandler.target;
            if(!target) {
                return null;
            }
            const compType: Constructor<Component> = js.getClassByName(eventHandler._componentName) as Constructor<Component>;
            if(!compType) {
                return null;
            }
            const comp:Component = target!.getComponent<Component>(compType);
            if(!comp) {
                return null;
            }
            return comp;
        }
        return null;
    }


}


