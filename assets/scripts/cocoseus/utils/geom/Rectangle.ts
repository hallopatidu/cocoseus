import { _decorator, Component, IRectLike, Node, Rect } from 'cc';
import { GEOM_CONST } from '../math/Const';
import { Line } from './Line';
const { ccclass, property } = _decorator;

export interface IRectangleLike extends IRectLike{

}

@ccclass('Rectangle')
export class Rectangle extends Rect implements IRectangleLike{

    /**
    * Returns a Line object that corresponds to the top of this Rectangle (LineA).
    * 
    * @param {Line} [out] - A Line object to set the results in. If `undefined` a new Line will be created.
    *
    * @return {Line} A Line object that corresponds to the top of this Rectangle.
    */
    // static getTopLine(out:Line, rect:Rect):Line {
    //     if (out === undefined) { out = new Line(); }
    //     out.set(rect.x, rect.y, rect.xMax, rect.y);
    //     return out;
    // }

    /**
     * Returns a Line object that corresponds to the right of this Rectangle. (LineB)
     *
     * @generic {Phaser.Geom.Line} O - [line,$return]
     *
     * @param {Phaser.Geom.Line} [out] - A Line object to set the results in. If `undefined` a new Line will be created.
     *
     * @return {Phaser.Geom.Line} A Line object that corresponds to the right of this Rectangle.
     */
    // static getRightLine(out:Line, rect:Rect):Line {    
    //     if (out === undefined) { out = new Line(); }
    //     out.set(rect.xMax, rect.y, rect.xMax, rect.yMin);
    //     return out;
    // }


    /**
     * Returns a Line object that corresponds to the bottom of this Rectangle. (Line C)
     *
     * @generic {Phaser.Geom.Line} O - [line,$return]
     *
     * @param {Phaser.Geom.Line} [out] - A Line object to set the results in. If `undefined` a new Line will be created.
     *
     * @return {Phaser.Geom.Line} A Line object that corresponds to the bottom of this Rectangle.
     */
    // static getBottomLine(out:Line, rect:Rect):Line {    
    //     if (out === undefined) { out = new Line(); }
    //     out.set(rect.xMax, rect.yMin, rect.x, rect.yMin);
    //     return out;
    // }

    /**
     * Returns a Line object that corresponds to the left of this Rectangle. (LineD)
     * @param {Phaser.Geom.Line} [out] - A Line object to set the results in. If `undefined` a new Line will be created.
     *
     * @return {Phaser.Geom.Line} A Line object that corresponds to the left of this Rectangle.
     */
    // getLeftLine (out:Line, rect:Rect):Line {    
    //     if (out === undefined) { out = new Line(); }

    //     out.set(rect.x , rect.yMin, rect.x, rect.y);

    //     return out;
    // }

    

    public declare type: number;

    /**
     * @en Constructs a Rect from another one.
     * @param other Specified Rect.
     */
    constructor (other: Rect|Rectangle);

    /**
     * @en Constructs a Rect with specified values.
     * @param x The minimum X coordinate of the rectangle.
     * @param y The minimum Y coordinate of the rectangle.
     * @param width The width of the rectangle, measured from the X position.
     * @param height The height of the rectangle, measured from the Y position.
     */
    constructor (x?: number, y?: number, width?: number, height?: number);

    constructor (x?: Rect | Rectangle | number, y?: number, width?: number, height?: number) {
        super();
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
            this.width = x.width;
            this.height = x.height;
        } else {
            this.x = x || 0;
            this.y = y || 0;
            this.width = width || 0;
            this.height = height || 0;
        }
        this.type = GEOM_CONST.RECTANGLE;
    }



}


