import { __private, _decorator, Component, Constructor, Enum, js, log } from 'cc';
import Pipelineify, { PipeDoneType, PipeJointType, PipeTask } from '../../plugins/Pipelinify';
import { IPipelineChain } from './PipelineType';

const { ccclass, property } = _decorator;

@ccclass('PipelineChain')
export default class PipelineChain extends Pipelineify(Component) implements IPipelineChain {

    static BlockEvent = {
        CANCEL: 'block_cancel',
    };

    @property({ serializable: true, visible: false })
    protected _isHeader: boolean = true;

    protected get isHeader(): boolean {
        return this._isHeader; 
    };

    protected set isHeader(value: boolean) {
        this._isHeader = value;
        if (!value) {
            this.hideAllPropertiesOfHeader();
        }
    }

    protected _resolve: PipeDoneType = null;

    // protected _taskMap:Map<number,IPipeTask> = new Map<number,IPipeTask>();

    protected _currentTaskId: number = -1;

    onLoad() {
        this._initChainBlocks()
        this.node?.on(PipelineChain.BlockEvent.CANCEL, () => this.cancel(), this); 
    }

    /**
     * Executes the chain block asynchronously with the provided input data.
     * 
     * This method wraps the execution in a Promise, creating a PipeTask and invoking the async pipeline.
     * The Promise resolves with the result of the pipeline or rejects if an error occurs during execution.
     * 
     * @template T The expected return type of the execution result.
     * @param data - Optional input data to be passed to the pipeline.
     * @returns A Promise that resolves with the result of the pipeline execution.
     */
    async execute<T = any>(data?: T): Promise<T> {
        try {
            return await new Promise((resolve: Function, reject: Function) => {
                const task: PipeTask = PipeTask.create({
                    input: data,
                    onComplete: (err: Error, data: any) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(data || true)
                        }
                    }
                }) as PipeTask;
                this.async(task);
            })
        } catch (err) {
            return;
        }
    }


    /**
     * 
     * @param taskId 
     */
    public cancel(): void {
        this.resolve(true);
    }


    /**
     * Attach the execute function of another Chain Block on the same node to the async Func of the first ChainBlock.
     *  
     */
    protected _initChainBlocks(fillerBlockClass:string|typeof PipelineChain = PipelineChain) {
        if (this.node) {
            const chainBlockClass: Constructor<unknown> = typeof fillerBlockClass == 'string' ? js.getClassByName(fillerBlockClass) : fillerBlockClass;
            const components: PipelineChain[] = this.node.getComponents<PipelineChain>(chainBlockClass as unknown as any) as PipelineChain[];  // type: [OrderComponent];
            if (components && components.length > 0) {
                const leader: Component = components[0];
                if (leader == this) {
                    this.isHeader = true;
                    // Attach each component's function call to the Pipeline List.
                    components.forEach((component: PipelineChain) => {
                        if (component !== this && !!component.execute) {
                            component.isHeader = false;
                            // Attach another component's execute function to the Pipeline List.
                            this._initEachBlock<typeof component>(component);
                        } else {
                            // cc.Class.Attr.setClassAttr(component, 'type', 'visible', 'false');
                            // CC_DEV && !component.execute && cc.warn('component ko co ham execute')
                        }
                    });
                }
            }
        }
    }

    /**
     * Init each block, but donot include header
     * @param component 
     */
    protected _initEachBlock<T extends PipelineChain>(component: T) {
        this.add(component.execute.bind(component));
    }


    /**
     * 
     */
    protected hideAllPropertiesOfHeader() {

    }

    /**
     * 
     * @param func 
     * @returns 
     */
    protected add(func: Function, option?: any) {
        const asyncFunc: PipeJointType = this.createPipeJoint(func, option);
        this.append(asyncFunc);
    }

    /**
     * 
     * @param func 
     * @param option 
     * @returns 
     */
    protected createPipeJoint(func: Function, option?: any): PipeJointType {
        return async (task: PipeTask, done: PipeDoneType) => {
            // task.done = done;
            this._resolve = done;
            task.output = task.input;
            try {
                const result: any = func(task.output, option);
                if ((result instanceof Promise) || (typeof result === 'object' && typeof result.then === 'function')) {
                    await result;
                }
                this.resolve();
            } catch (err) {
                this.resolve(err);
            }
        }
    }

    /**
     *    
     * @param stopImmediately 
     */
    protected resolve(stopImmediately: boolean | Error = false): void {
        // if(this._taskMap.size === 0) return null;
        // const task:IPipeTask = this._taskMap?.get(taskId);
        // if(task){
        //     const pipeDone:PipeDone = task.done;
        //     task.done = null;
        //     task.isFinished = true;
        //     pipeDone && pipeDone(stopImmediately);
        // }else{
        //     throw new Error(`Cannot find task with id ${taskId}`);
        // }
        // return task;
        if (this._resolve) {
            const pipeDone: PipeDoneType = this._resolve;
            this._resolve = null;
            pipeDone && pipeDone(stopImmediately);
        }

    }


}

