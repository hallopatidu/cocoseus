import { _decorator, AssetManager, Component, Constructor, warn } from 'cc';
import { cocoseus_classify } from '../definition/cocoseus.classify';

const {CCClassify} = cocoseus_classify

export const PipelinifiedClassName:string = "Pipelineify";
export interface IPipelinify {
    insert (func: PipeJointType, index: number): IPipelinify
    append (func: PipeJointType): IPipelinify
    remove (index: number): IPipelinify
    sync (task: PipeTask): any 
    async (task:  PipeTask): void
}

export interface IPipeTask extends AssetManager.Task{}
export type PipeJointType = ((task: IPipeTask, done: PipeDoneType ) => void) | ((task: IPipeTask) => Error | void);
export type PipeDoneType = (err?: Error | null | Boolean) => void;
export class PipeTask extends AssetManager.Task implements IPipeTask{
    static Event = {
        COMPLETED:'complete',
        PROGRESS:'progress',
        ERROR:'error'
    }
}

export interface ITaskOption {
    onComplete?: ((err: Error | null | undefined, data: any) => void) | null;
    onProgress?: ((...args: any[]) => void) | null;
    onError?: ((...args: any[]) => void) | null;
    input: any;
    progress?: any;
    options?: Record<string, any> | null; 
}


export default CCClassify<IPipelinify>(function pipelinify<TBase>(base:Constructor<TBase>):Constructor<TBase & IPipelinify>{
    /**
     * @class Pipelineified
     * @extends Component
     * @implements IPipelinify
     * @description A pipeline system that allows sequential processing of tasks through a series of pipes (functions).
     * 
     * Each pipe in the pipeline can process a task either synchronously or asynchronously.
     * The output of one pipe becomes the input for the next pipe in the sequence.
     * 
     * @example
     * ```typescript
     * // Create a pipeline class component
     * @ccclass('ExamplePipeLine')
     * export default class ExamplePipeLine extends cocoseus.modifier.PipelineifyClass(Component) {
     *      //......
     * }
     * 
     * @property {Array<PipeJoint>} pipes - Array of pipe functions that process tasks sequentially
     * 
     * @remarks
     * - Each pipe can be either synchronous or asynchronous
     * - For synchronous pipes, simply return an error to halt the pipeline or void to continue
     * - For asynchronous pipes, use the done callback to signal completion
     * - Tasks can carry both input and output data between pipes
     * - Pipeline execution can be done either synchronously (sync) or asynchronously (async)
     * 
     * @limitations
     * - All pipes must follow the PipeJoint interface
     * - Error handling in async mode requires proper use of the done callback
     * - Task state must be properly managed between pipes
     * - Cannot mix sync and async pipes in the same pipeline execution
     * 
     * @see {@link PipeTask} For task object structure
     * @see {@link PipeJointType} For pipe function interface
     * @see {@link IPipelinify} For pipeline interface
     */
    class Pipeline_ified extends (base as unknown as Constructor<Component>)implements IPipelinify{

        public pipes: Array<PipeJointType> = [];

        constructor(){
            super()
        }

        /**
         * @en
         * Inserts a new pipe to pipeline at specific point .
         *
         * @param func @en The new pipe to be inserted.
         * @param func.task @en The task handled with pipeline will be transferred to this function.
         * @param func.done
         * @en Callback you need to invoke manually when this pipe is finished. if the pipeline is synchronous, callback is unnecessary.
         * @param index @en The specific point you want to insert at.
         * @return @en Returns the Pipeline itself, which can be used to make chain calls.
         *
         * @example
         * var pipeline = new Pipeline('test', []);
         * pipeline.insert((task, done) => {
         *      // do something
         *      done();
         * }, 0);
         *
         */
        public insert (func: PipeJointType, index: number): IPipelinify {
            if (index > this.pipes.length) {
                warn('Index is out of pipes length');
                return this;
            }

            this.pipes.splice(index, 0, func);
            return this;
        }

        /**
         * @en
         * Appends a new pipe to the pipeline.
         *
         * @param func @en The new pipe to be appended.
         * @param func.task
         * @en The task handled with pipeline will be transferred to this function.
         * @param func.done
         * @en Callback you need to invoke manually when this pipe is finished. if the pipeline is synchronous, callback is unnecessary.
         * @return @en Returns the Pipeline itself, which can be used to make chain calls. 
         *
         * @example
         * var pipeline = new Pipeline('test', []);
         * pipeline.append((task, done) => {
         *      // do something
         *      done();
         * });
         *
         */
        public append (func: PipeJointType): IPipelinify {
            this.pipes.push(func);
            return this;
        }

        /**
         * @en
         * Removes pipe which at specific joint.
         * 
         * @param index @en The specific joint. 
         * @return @en Returns the Pipeline itself, which can be used to make chain calls. 
         *
         * @example
         * var pipeline = new Pipeline('test', (task, done) => {
         *      // do something
         *      done();
         * });
         * pipeline.remove(0);
         *
         */
        public remove (index: number): IPipelinify {
            this.pipes.splice(index, 1);
            return this;
        }

        /**
         * @en
         * Executes task synchronously. Run in a for loop
         *
         * @param task @en The task will be executed. 
         * @returns @en The execution result. 
         *
         * @example
         * var pipeline = new Pipeline('sync', [(task) => {
         *      let input = task.input;
         *      task.output = doSomething(task.input);
         * }]);
         *
         * var task = new Task({input: 'test'});
         * console.log(pipeline.sync(task));
         *
         */
        public sync (task: PipeTask): any {
            const pipes = this.pipes;
            if (pipes.length === 0) {
                return null; 
            }
            task.isFinished = false;
            for (let i = 0, l = pipes.length; i < l;) {
                const pipe = pipes[i] as ((task: PipeTask) => Error | void);
                const result = pipe(task);
                if (result) {
                    task.isFinished = true;
                    return result;
                }
                i++;
                if (i !== l) {
                    task.input = task.output;
                    task.output = null;
                }
            }
            task.isFinished = true;
            return task.output as unknown;
        }

        /**
         * @en
         * Executes task asynchronously. Runs recursively.
         *
         * @param task @en The task will be executed.
         *
         * @example
         * var pipeline = new Pipeline('sync', [(task, done) => {
         *      let input = task.input;
         *      task.output = doSomething(task.input);
         *      done();
         * }]);
         * var task = new Task({input: 'test', onComplete: (err, result) => console.log(result)});
         * pipeline.async(task);
         *
         */
        public async (task:  PipeTask): void {
            const pipes = this.pipes;
            if (pipes.length === 0) { 
                task.isFinished = true;
                task.dispatch(PipeTask.Event.COMPLETED);
                return; 
            }
            task.isFinished = false;
            this._flow(0, task);
        }


        /**
         * 
         * @param index 
         * @param task 
         */
        private _flow (index: number, task:  PipeTask): void {
            const pipe = this.pipes[index];
            pipe(task, (result) => {
                if (result) {
                    task.isFinished = true;
                    task.dispatch(PipeTask.Event.COMPLETED, result);
                } else {
                    index++;
                    if (index < this.pipes.length) {
                        // move output to input
                        task.input = task.output;
                        task.output = null;
                        this._flow(index, task);
                    } else {
                        task.isFinished = true;
                        task.dispatch(PipeTask.Event.COMPLETED, result, task.output);
                    }
                }
            });
        }
    }

    return Pipeline_ified as unknown as Constructor<TBase & IPipelinify>;
}, PipelinifiedClassName)