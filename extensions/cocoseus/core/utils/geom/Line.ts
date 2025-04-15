import { _decorator, Component, Node, ValueType } from 'cc';
import { GEOM_CONST } from '../math/Const';
const { ccclass, property } = _decorator;

/**
 * Defines a Line segment, a part of a line between two endpoints.
 * This class do not declare as a CCClass, because there is a same Line Class in cocos core engine.
 */
export class Line extends ValueType {

    public declare x1: number;
    public declare y1: number;
    public declare x2: number;
    public declare y2: number;
    public declare type: number;

    /**
     * @en Defines a Line segment, a part of a line between two endpoints.
     * @param other Specified Circle.
     */
    constructor (other: Line);

    /**
     * @en Defines a Line segment, a part of a line between two endpoints.
     * @param {number} [x1=0] - The x coordinate of the lines starting point.
     * @param {number} [y1=0] - The y coordinate of the lines starting point.
     * @param {number} [x2=0] - The x coordinate of the lines ending point.
     * @param {number} [y2=0] - The y coordinate of the lines ending point.
     */
    constructor (x1?: number, y1?: number, x2?: number, y2?: number);

    constructor (x1: Line | number = 0, y1: number = 0, x2: number = 0, y2:number = 0) {
        super();
        if (typeof x1 === 'object') {
            this.x1 = x1.x1;
            this.y1 = x1.y1;
            this.x2 = x1.x2;
            this.y2 = x1.y2;
        } else {
            this.x1 = x1 || 0;
            this.y1 = y1 || 0;
            this.x2 = x2 || 0;
            this.y2 = y2 || 0;
        }
        this.type = GEOM_CONST.LINE;
    }

    /**
     * @en clone the current Line.
     */
    public clone (): Line {
        return new Line(this.x1, this.y1, this.x2, this.y2);
    }


    /**
     * @en Set values with another Line.
     * @param other Specified Circle.
     * @returns `this`
     */
    public set (other: Line): any;

    /**
     * @en Set the value of each component of the current Line.
     * @param x The x parameter of the specified line.
     * @param y The y parameter of the specified line.
     * @param width The width parameter of the specified line.
     * @param height The height parameter of the specified line.
     * @returns `this`
     */
    public set (x1:number, y1:number, x2:number, y2:number): any;

    public set (x1?: Line | number, y1?: number, x2?: number, y2?:number): any {
        if (typeof x1 === 'object') {
            this.x1 = x1.x1;
            this.y1 = x1.y1;
            this.x2 = x1.x2;
            this.y2 = x1.y2;
        } else {
            this.x1 = x1 || 0;
            this.y1 = y1 || 0;
            this.x2 = x2 || 0;
            this.y2 = y2 || 0;
        }
        return this;
    }

    /**
     * @en Check whether the current Line equals another one.
     * @param other Specified lines.
     * @returns Returns `true' when the minimum and maximum values of both lines are equal, respectively; otherwise, returns `false'.
     */
    public equals (other: Line): boolean {
        return this.x1 === other.x1
            && this.y1 === other.y1
            && this.x2 === other.x2
            && this.y2 === other.y2
    }

    /**
     * @en Calculate the interpolation result between this Line and another one with given ratio.
     * @param to Target Line.
     * @param ratio The interpolation coefficient.The range is [0,1].
     */
    public lerp (to: Line, ratio: number): Line {
        const x1 = this.x1;
        const y1 = this.y1;
        const x2 = this.x2;
        const y2 = this.y2;
        this.x1 = x1 + (to.x1 - x1) * ratio;
        this.y1 = y1 + (to.y1 - y1) * ratio;
        this.x2 = x2 + (to.x2 - x2) * ratio;
        this.y2 = y2 + (to.y2 - y2) * ratio;
        return this;
    }

    /**
     * @en Return the information of the current line in string.
     * @returns The information of the current line in string.
     */
    public toString (): string {
        return `(${this.x1.toFixed(2)}, ${this.y1.toFixed(2)}, ${this.x2.toFixed(2)}, ${this.y2.toFixed(2)})`;
    }

}


