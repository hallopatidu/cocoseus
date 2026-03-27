import { __private, _decorator, Enum, sp } from 'cc';
import { PipeDoneType, PipeTask } from '../../plugins/Pipelinify';

const { ccclass, property } = _decorator;

export enum BlockProgressType {
    SEQUENCE,
    PARALLEL
}
Enum(BlockProgressType);

export enum PipelineStatus {
    INIT,
    START,
    END,
}

export interface IPipelineChain {
    execute<T = any>(data?: T): Promise<T>
    cancel(): void
}

export interface IPipelinePlayer extends IPipelineChain {
    get totalDuration(): number
}

export interface IChainTask extends PipeTask {
    set done(value: PipeDoneType);
    get done(): PipeDoneType
}
// export type PipeJoint = ((task: IPipeTask, done: PipeDone ) => void) | ((task: IPipeTask) => Error | void);
// export type PipeDone = (err?: Error | null | Boolean) => void;


// export const BlockEvent = {
//     CANCEL: 'block_cancel',
// } 
