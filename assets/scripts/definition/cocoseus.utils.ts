import { Component, Constructor, Node, Rect, Size, tween, UITransform, Vec2, Vec3 } from "cc";
import { DEV } from "cc/env";



export namespace cocoseus_utils {

    export namespace strings {
        /**
        * 
        * @param fullPath 
        */
        export function *getPartialPath(fullPath:string, decreases:boolean = false):Generator<string[]>{
            const partialPaths:string[] = fullPath.replace(/(db|http|https):\/\//g,'').split(/\/|\\/);
            let path:string = '';
            let baseUrl:string = '';
            while(partialPaths.length){
                path = partialPaths.shift();
                baseUrl += (baseUrl.length ? '/' : '') + path;
                yield [baseUrl, path];
            }
            if(DEV){
                decreases;
            }
        }

        /**
         * 
         * @param str 
         * @returns 
         */
        export function upperFirstCharacter(str:string):string{
            return str.replace(/\b\w/g, c => c.toUpperCase()).replace(/(?=[A-Z])/g,' ').toString();
        }

        /**
         * 
         * @param value 
         * @returns 
         */
        export function hashString(value:string):number {
            // Default
            if(!value) {
                return 0
            }
            let hash:number = 5381,i:number=value.length;      
            while(i) {
                hash = (hash * 33) ^ value.charCodeAt(--i);
            }
        
            /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
            * integers. Since we want the results to be always positive, convert the
            * signed int to an unsigned by doing an unsigned bitshift. */
            return hash >>> 0;
            // --------------------
            
        }

        export function getPathWithoutFileName(fullUrl: string): string | null {
            const match = fullUrl.match(/^([a-zA-Z]+:\/\/.+\/)[^\/]+\.[^\/]+$/);
            return match ? match[1] : null;
        }

        /**
         * Sử dụng regex để lấy tên file không có phần mở rộng từ URL.
         * Ấn định rằng tên file không chứa dấu gạch chéo (/) hoặc dấu chấm (.) trong tên.
         @example
        * @param url 
        * @returns 
        */
        export function getFilenameWithoutExtension(url: string): string {
            const pathname = new URL(url).pathname;
            const match = pathname.match(/\/([^\/]+?)(?:\.[^\/.]+)?$/);
            return match ? match[1] : '';
        }
    }

    export namespace ui {
        /**
        * 
        * @param node 
        * @param klass 
        * @returns 
        */
        export function findRootNode(currentNode:Node):Node{
            return currentNode && currentNode.parent ? this.findRootNode(currentNode.parent) : currentNode;
        }

        /**
        * 
        * @param node 
        * @param klass 
        * @returns 
        */
        export function findComponentInParent<T extends Component>(node:Node, klass:Constructor<T>, fillter?:(comp:T)=>boolean):T{
            if(node && node.parent && klass){
                const parent:Node = node.parent;
                if(!parent){
                    return null;
                }
                let components:T[] = parent.getComponentsInChildren(klass);
                if(fillter){
                    components = components.filter(fillter);
                }
                const foundComponent:T = components.length ? components[0] : undefined;//.find((comp:T)=> js.isChildClassOf(comp.constructor, klass));
                return foundComponent ? foundComponent : findComponentInParent<T>(parent, klass, fillter);
            }
        }

        /**
        * 
        * @param node 
        * @param klass 
        * @returns 
        */
        export function findComponentsInParent<T extends Component>(node:Node, klass:Constructor<T>):T[]{
            if(node && node.parent && klass){
                const parent:Node = node.parent;
                if(!parent){
                    return null;
                }
                const foundComponents:T[] = parent.getComponentsInChildren(klass);
                return foundComponents && foundComponents.length ? foundComponents : findComponentsInParent<T>(parent, klass);
            }
        }

        /**
         * 
         * @param targetNode 
         * @param toCordinateOfNode 
         * @returns 
         */
        export function relocateUIBoundingBox(targetNode:Node, toCordinateOfNode:Node):Rect{
            const targetTranform:UITransform = targetNode.getComponent(UITransform);
            if(!targetNode.parent) {
                return null;
            }
            const targetAnchorPoint:Vec2 = targetTranform.anchorPoint;
            const boudingBox:Rect = targetTranform.getBoundingBox();
            const relocateMinPoint:Vec3 = convertUICordinate(new Vec3(boudingBox.xMin, boudingBox.yMin , boudingBox.z), targetNode.parent, toCordinateOfNode);
            const relocateMaxPoint:Vec3 = convertUICordinate(new Vec3(boudingBox.xMax, boudingBox.yMax , boudingBox.z), targetNode.parent, toCordinateOfNode);        
            const relocateBoxWidth:number = (relocateMinPoint && relocateMaxPoint) ? (relocateMaxPoint.x - relocateMinPoint.x) : targetTranform.contentSize.width;
            const relocateBoxHeight:number = (relocateMinPoint && relocateMaxPoint) ? (relocateMaxPoint.y - relocateMinPoint.y) : targetTranform.contentSize.height;
            const offsetX:number = targetAnchorPoint.x * relocateBoxWidth;
            const offsetY:number = targetAnchorPoint.y * relocateBoxHeight;
            const posX:number = relocateMinPoint ? relocateMinPoint.x + offsetX : 0;
            const posY:number = relocateMinPoint ? relocateMinPoint.y + offsetY : 0;
            return new Rect(posX, posY, relocateBoxWidth, relocateBoxHeight);
        }

        /**
         * 
         * @param point 
         * @param fromCordinateOfNode 
         * @param toCordinateOfNode 
         * @returns 
         */
        export function convertUICordinate(point:Vec3, fromCordinateOfNode:Node, toCordinateOfNode:Node):Vec3{
            const fromUITranform:UITransform = fromCordinateOfNode.getComponent(UITransform) || fromCordinateOfNode.addComponent(UITransform);
            const toUITranform:UITransform = toCordinateOfNode.getComponent(UITransform) || toCordinateOfNode.addComponent(UITransform);
            if(fromUITranform && toUITranform){
                const worldPoint:Vec3 = new Vec3();
                const relocatePoint:Vec3 = new Vec3();
                fromUITranform.convertToWorldSpaceAR(point, worldPoint);
                toUITranform.convertToNodeSpaceAR(worldPoint, relocatePoint);
                return relocatePoint;
            }
            return null
        }

        /**
         * Calculate the right alignment size.
         * In this case isCover = false:
         * You want to put a node inside other node so that the target size fit to height or fit to width with the pattern node.
         * @param elementSize    
         * @param containerSize 
         * @param isCover // if true, the returning size  will be coverd container size.
         * @returns 
         */
        export function calculateAligning(elementSize:Size, containerSize:Size, isCover:boolean = false):Size{
            const heightRatio:number = elementSize.height/containerSize.height;
            const widthRatio:number = elementSize.width/containerSize.width;
            return (widthRatio > heightRatio)!==isCover ? new Size(containerSize.width, elementSize.height*(1/widthRatio)) : new Size(elementSize.width*(1/heightRatio), containerSize.height);        
        }

    }


    export namespace functions {
        export async function asyncCall(func:Function, ...args:any[]):Promise<any>{
            // try{
            const result:any = func(...args);
            if ((result instanceof Promise) || (typeof result === 'object' && typeof result.then === 'function')) {
                return await result;
            }
            return result;
            // }catch (error) {
            //     // throw error;
            // }
        }
        
        /**
         * 
         * @param time 
         * @returns 
         */
        export async function asyncDelay(time:number):Promise<void>{
            return new Promise<void>((resolve:Function)=>{
                tween({}).delay(time)
                    .call(() => {
                        resolve();
                    })
                    .start();          
            });
        }
    }

    export namespace structor {
        /**
         * Detect Cycle in a Directed Graph Data . BFS solution (Bread First Search);
         * a BFS solution that will find one cycle (if there are any), which will be (one of) the shortest
         * Ex: var graph = {
         *     a: ['b', 'c'],
         *     b: ['d', 'c'],
         *     e: ['a', 'b'],
         *     d: ['e']
         * };
         * @param graph 
         * @returns 
         */
        export function getCycle(graph:{[n:number]:number[]}) {
            let queue = Object.keys(graph).map( key => [key.toString()] );
            while (queue.length) {
                const batch = [];
                for (const path of queue) {
                    const parents = graph[parseInt(path[0])] || [];
                    for (const key of parents) {
                        if (key === parseInt(path[path.length-1])) return [key, ...path.map(key=>parseInt(key))];
                        batch.push([key, ...path.map(key=>parseInt(key))]);
                    }
                }
                queue = batch;
            }        
        }

        
    }
}