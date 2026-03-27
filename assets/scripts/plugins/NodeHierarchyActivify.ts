import { __private, _decorator, Canvas, Component, Constructor, js, Node, NodeEventType, Vec3 } from 'cc';


import { DEV } from 'cc/env';
import { cocoseus } from '../definition/cocoseus';
import { cocoseus_types } from '../definition/cocoseus.types';
import { cocoseus_classify } from '../definition/cocoseus.classify';
const { ccclass, property } = _decorator;
const {CCClassify} = cocoseus_classify

interface INodeHierarchyActivify extends Component{}
interface INodeBranchActivify extends INodeHierarchyActivify{
    activeNodeInHierarchy(node:Node, deactiveList?:Node[]):()=>void|null;
    deactiveNodeInHierarchy():void
}
interface INodeOnTopActivify{}

type PluginHandler = (node:Node, prop:string, value?:any)=>void;
type SubConstructor<T,TSub> = cocoseus_types.SubConstructor<T,TSub>;

const NodeHierarchyPlugin = Symbol();

/**
 * Additional functionality.
 * 
 */
export const NodeHierarchyActivify = CCClassify<INodeHierarchyActivify>(function nodeHierarchyActivify<TBase>(base:Constructor<TBase>):SubConstructor<TBase, INodeHierarchyActivify>{
    const NodeTag = Symbol();
    
    // 
    // if(DEV){
    //     debugger;
    // }
    class NodeHierarchyActivified extends (base as unknown as Constructor<Component>){
        private pluginMap:Map<string, PluginHandler[]> = new Map();
        /**
         * 
         */
        protected onLoad(): void {
            const _this:NodeHierarchyActivified = this;
            this[NodeTag] = this.node;
            // this.node = new Proxy(this[NodeTag], {  
            //     // get: (node:Node, prop:string, receiver) =>{
            //     //     const value:any = node[prop];
            //     //     if (value instanceof Function) {
            //     //         return function (...args:any[]) {
            //     //             return value.apply(this === receiver ? node : this, args);
            //     //         };
            //     //     }
            //     //     return value;
            //     // },
            //     set: (node:Node, prop:string, value:any) =>{
            //         node[prop] = value;
            //         if(_this.pluginMap.has(prop)){
            //             const pluginHandlers:PluginHandler[] = _this.pluginMap.get(prop);
            //             pluginHandlers.forEach((handler:PluginHandler)=>{
            //                 handler.call(this, node, prop, value);
            //             })
            //         }
            //         return true;
            //     }
            // })
            super.onLoad && super.onLoad();
        }   

        /**
         * 
         * @param propKey 
         * @param handler 
         */
        protected [NodeHierarchyPlugin](propKey:string, handler:PluginHandler){
            if(!this.pluginMap.has(propKey)){
                let handlers:PluginHandler[] = this.pluginMap.get(propKey);
                if(!handlers || !handlers.length){
                    handlers = [];
                }
                handlers.push(handler);
                this.pluginMap.set(propKey, handlers);
            }else{
                throw new Error('Double keys register')
            }
        }

    }
    return NodeHierarchyActivified as unknown as SubConstructor<TBase, INodeHierarchyActivify>
}, 'NodeHierarchyActivify')




/**
 * Additional functionality.
 * Upgrade the node's active function to allow activation even when its parent node is deactivated.
 * 
 */
export const NodeBranchActivify = CCClassify<INodeBranchActivify>(function nodeBranchActivify<TBase>(base:Constructor<TBase>):SubConstructor<TBase, INodeBranchActivify>{
    const RestoreActivedNodeHandler = Symbol()//.toString();
    // 
    if(DEV){
        debugger;
    }

    class NodeBranchActivified extends NodeHierarchyActivify(base as unknown as Constructor<Component>) implements INodeBranchActivify{
        /**
         * 
         */
        protected onLoad(): void {
            if(this[NodeHierarchyPlugin]){
                this[NodeHierarchyPlugin]('active', (node:Node, prop:string, value:boolean)=>{
                    if(node && !node.activeInHierarchy && !!value){
                        this.activeNodeInHierarchy(node.parent);
                    }else{
                        this.deactiveNodeInHierarchy();
                    }
                })
            }else{
                throw new Error('Need class base extends from NodeHierarchyActivify !');
            }
            super.onLoad && super.onLoad();
        }        

        
        /**
         * Search upwards to parent nodes to ensure the node is actived.
         * By activating all nodes in the hierarchy of the node.
         * Returns a function that, when called, will restore the original state of the nodes before displaying the animation.
         * @param {*} node 
         * @param {*} deactiveList 
         * @returns {function} Returns a function that, when called, will restore the nodes that were activated.
         */
        public activeNodeInHierarchy(node:Node, deactiveList?:Node[]):()=>void|null{
            if(node && node.parent){
                deactiveList = deactiveList || [];
                if(node.active == false){
                    deactiveList.push(node);
                    node.active = true;
                }
                return this.activeNodeInHierarchy(node.parent, deactiveList);
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
        public deactiveNodeInHierarchy():void{
            if(!!this[RestoreActivedNodeHandler]){
                this[RestoreActivedNodeHandler]()
                this[RestoreActivedNodeHandler] = null;
            }
        }

    }
    return NodeBranchActivified as unknown as SubConstructor<TBase, INodeBranchActivify>
}, 'NodeBranchActivify');


/**
 * Additional functionality.
 * Whenever activated, the component will bring the attached node to the top of the display.
 * 
 */
export const NodeOnTopActivify = CCClassify<INodeOnTopActivify>(function activeOnTopOfGame<TBase>(base:Constructor<TBase>):Constructor<TBase & INodeOnTopActivify>{
    if(!js.isChildClassOf(base, Component)){
        throw new Error('Just only use for subclass of Component')
    }

    /**
    * 
    * @param node 
    * @param klass 
    * @returns 
    */
    function findRootComponentNode(node:Node, klass:Constructor<Component>, fillter?:(comp:Component)=>boolean):Node{
        if(node && node.parent && klass){
            const parent:Node = node.parent;
            if(!parent){
                return null;
            }
            let components:Component[] = parent.getComponentsInChildren(klass);
            if(fillter){
                components = components.filter(fillter);
            }
            const foundComponent:Component = components.length ? components[0] : undefined;//.find((comp:T)=> js.isChildClassOf(comp.constructor, klass));
            return foundComponent ? foundComponent.node : findRootComponentNode(parent, klass, fillter);
        }
        return node;
    }

    const hierarchyTopupList:string[] = []; 

    /**
     * If the node is in the scene, the node containing the Canvas is the topmost node.
     * If it's inside a prefab, the topmost node is the one without a parent node.
     * When the node is deactivated, it will return to its original position in the node hierarchy.
     */
    class NodeOnTopActivified extends (base as unknown as Constructor<Component>) implements INodeOnTopActivify{
        protected _parrentInEditor:Node = null;
        protected _topParent:Node = null;
        protected _currentSiblingIndex:number = 0;
        protected _currentHiearachyPath:string = null;
        protected _currentParent:Node = null;

        protected onLoad(): void {
            // 
            this._parrentInEditor = this.node?.parent;
            this._currentSiblingIndex = this.node.getSiblingIndex();
            this._currentParent = this._parrentInEditor;
            this._currentHiearachyPath = this.node.getPathInHierarchy();
            // If the node is in the scene, the node containing the Canvas is the topmost node.
            // If it's inside a prefab, the topmost node is the one without a parent node.
            this._topParent = findRootComponentNode(this.node, Canvas);
            hierarchyTopupList.push(this._currentHiearachyPath);
            // 
            this.node.on(NodeEventType.ACTIVE_IN_HIERARCHY_CHANGED, this.onActivedDialog.bind(this));// NodeEventType.ACTIVE_IN_HIERARCHY_CHANGED
            super.onLoad && super.onLoad();
        }

        public get siblingTopIndex():number{
            return hierarchyTopupList.indexOf(this._currentHiearachyPath);
        }

        protected onActivedDialog(){
            if(this.node.active){
                this.reparent(this._topParent);
            }else{
                this.reparent(this._parrentInEditor);
                this._currentParent.off(NodeEventType.CHILD_ADDED, this.onChangeSiblingIndex.bind(this));
                this.node.setSiblingIndex(this._currentSiblingIndex);
            }
        }

        protected onChangeSiblingIndex(){
            this.node.setSiblingIndex(this.node.parent.children.length - 1 + this.siblingTopIndex);
        }

        protected onDestroy(): void {
            hierarchyTopupList.splice(this.siblingTopIndex, 1);
            this.node.off(NodeEventType.ACTIVE_IN_HIERARCHY_CHANGED);
            this._currentParent && this._currentParent.off(NodeEventType.SIBLING_ORDER_CHANGED);
            super.onDestroy && super.onDestroy();
        }
        

        /**
         * 
         * @param node 
         * @param newParent 
         */
        private reparent(newParent:Node){
            if(newParent){
                // 
                this._currentParent.off(NodeEventType.CHILD_ADDED, this.onChangeSiblingIndex.bind(this));
                // 
                let nodePos:Vec3 = new Vec3()
                this.node.getPosition(nodePos);
                cocoseus.utils.ui.convertUICordinate(nodePos , this.node.parent, newParent);
                newParent.addChild(this.node);
                this.node.setPosition(nodePos);
                // 
                this._currentParent = newParent;
                this._currentParent.on(NodeEventType.CHILD_ADDED, this.onChangeSiblingIndex.bind(this));
                // 
            }
        }

    }

    return NodeOnTopActivified as unknown as SubConstructor<TBase , INodeOnTopActivify>;
}, 'NodeOnTopActivify')