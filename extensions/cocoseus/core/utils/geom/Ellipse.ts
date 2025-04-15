import { _decorator, Component, IRectLike, Node, Rect, ValueType, Vec2 } from 'cc';
import { GEOM_CONST, MATH_CONST } from '../math/Const';
import { MathCommon } from '../math/MathCommon';
import { MathAngle } from '../math/MathAngle';




const { ccclass, property } = _decorator;

export interface IEllipseLike {
    x: number;
    y: number;
    width:number;
    height:number
}



@ccclass('Ellipse')
export class Ellipse extends ValueType {


    /**
     * Returns the circumference of the given Ellipse.
     *
     * @param {Ellipse} ellipse - The Ellipse to get the circumference of.
     *
     * @return {number} The circumference of the Ellipse.
     */
    static circumference (ellipse:Ellipse):number {
        const rx = ellipse.width / 2;
        const ry = ellipse.height / 2;
        const h = Math.pow((rx - ry), 2) / Math.pow((rx + ry), 2);    
        return (Math.PI * (rx + ry)) * (1 + ((3 * h) / (10 + Math.sqrt(4 - (3 * h)))));
    };


    /**
     * Calculates the area of the Ellipse.
     *
     * @param {Ellipse} ellipse - The Ellipse to get the area of.
     *
     * @return {number} The area of the Ellipse.
     */
    static area(ellipse:Ellipse):number
    {
        // if (ellipse.isEmpty())
        if (ellipse.width <= 0 || ellipse.height <= 0) return 0;
        //  units squared
        return (ellipse.majorRadius * ellipse.minorRadius * Math.PI);
    };


    /**
     * Returns a Point object containing the coordinates of a point on the circumference of the Ellipse based on the given angle.
     *
     * @param {Ellipse} Ellipse - The Ellipse to get the circumference point on.
     * @param {number} angle - The angle from the center of the Ellipse to the circumference to return the point from. Given in radians.
     * @param {Vec2} [out] - A Point, or point-like object, to store the results in. If not given a Point will be created.
     *
     * @return {Vec2} A Point object where the `x` and `y` properties are the point on the circumference.
     */
    static circumferencePoint(ellipse:Ellipse, angle:number, out?:Vec2):Vec2 {
        if (out === undefined) { out = new Vec2(); }
        const halfWidth = ellipse.width / 2;
        const halfHeight = ellipse.height / 2;
        out.x = ellipse.x + halfWidth * Math.cos(angle);
        out.y = ellipse.y + halfHeight * Math.sin(angle);
        return out;
    };


    /**
     * Check to see if the Ellipse contains the given x / y coordinates.
     *
     * @param {number} x - The x coordinate to check within the ellipse.
     * @param {number} y - The y coordinate to check within the ellipse.
     *
     * @return {boolean} True if the coordinates are within the ellipse, otherwise false.
     */
    static contains (ellipse:Ellipse, x:number, y:number):boolean{
        if (ellipse.width <= 0 || ellipse.height <= 0) return false;
        //  Normalize the coords to an ellipse with center 0,0 and a radius of 0.5
        let normx = ((x - ellipse.x) / ellipse.width);
        let normy = ((y - ellipse.y) / ellipse.height);
        normx *= normx;
        normy *= normy;
        return (normx + normy < 0.25);
    }


    /**
     * Check to see if the Ellipse contains the given Point object.
     *
     * @param {Ellipse} ellipse - The Ellipse to check.
     * @param {Vec2} point - The Point object to check if it's within the Ellipse or not.
     *
     * @return {boolean} True if the Point coordinates are within the Ellipse, otherwise false.
     */
    static containsPoint (ellipse:Ellipse, point:Vec2):boolean
    {
        return this.contains(ellipse, point.x, point.y);
    };
    
    /**
     * Check to see if the Ellipse contains all four points of the given Rect object.
     *
     * @param {Ellipse} ellipse - The Ellipse to check.
     * @param {(Rect} rect - The Rectangle object to check if it's within the Ellipse or not.
     *
     * @return {boolean} True if all of the Rect coordinates are within the ellipse, otherwise false.
     */
    static containsRect (ellipse:Ellipse, rect:Rect):boolean
    {
        return (
            this.contains(ellipse, rect.x, rect.y) &&
            this.contains(ellipse, rect.xMax, rect.y) &&
            this.contains(ellipse, rect.x, rect.yMin) &&
            this.contains(ellipse, rect.xMax, rect.yMin)
        );
    };

    /**
     * Copies the `x`, `y` and `radius` properties from the `source` Ellipse
     * into the given `dest` Ellipse, then returns the `dest` Ellipse.
     * 
     * @param { Ellipse} source - The source Ellipse to copy the values from.
     * @param { Ellipse} dest - The destination Ellipse to copy the values to.
     *
     * @return { Ellipse} The destination Ellipse.
     */
    static copyFrom(source:Ellipse, dest:Ellipse):Ellipse
    {
        return dest.set(source.x, source.y, source.width, source.height);
    };


    /**
     * Returns the bounds of the Ellipse object.
     *
     * @param { Ellipse} Ellipse - The Ellipse to get the bounds from.
     * @param {( Rectangle|object)} [out] - A Rectangle, or rectangle-like object, to store the Ellipse bounds in. If not given a new Rectangle will be created.
     *
     * @return {( Rectangle|object)} The Rectangle object containing the Ellipses bounds.
     */
    static getBounds(ellipse:Ellipse, out:Rect):Rect {
        if (out === undefined) { out = new Rect(); }
        out.x = ellipse.left;
        out.y = ellipse.top;
        out.width = ellipse.width;
        out.height = ellipse.height;
        return out;
    };


    /**
     * Returns a Point object containing the coordinates of a point on the circumference of the Ellipse
     * based on the given angle normalized to the range 0 to 1. I.e. a value of 0.5 will give the point
     * at 180 degrees around the circle.
     * 
     * @param {Ellipse} ellipse - The Ellipse to get the circumference point on.
     * @param {number} position - A value between 0 and 1, where 0 equals 0 degrees, 0.5 equals 180 degrees and 1 equals 360 around the ellipse.
     * @param {Vec2} [out] - An object to store the return values in. If not given a Point object will be created.
     *
     * @return {Vec2} A Point, or point-like object, containing the coordinates of the point around the ellipse.
     */
    static getPoint(ellipse:Ellipse, position:number, out:Vec2):Vec2 {
        if (out === undefined) { out = new Vec2(); }
        const angle = MathCommon.fromPercent(position, 0, MATH_CONST.PI2);
        return this.circumferencePoint(ellipse, angle, out);
    };


    /**
     * Returns an array of Point objects containing the coordinates of the points around the circumference of the Ellipse,
     * based on the given quantity or stepRate values.
     *
     * @param {Ellipse} ellipse - The Ellipse to get the points from.
     * @param {number} quantity - The amount of points to return. If a falsey value the quantity will be derived from the `stepRate` instead.
     * @param {number} [stepRate] - Sets the quantity by getting the circumference of the ellipse and dividing it by the stepRate.
     * @param {Vec2[]} [output] - An array to insert the points in to. If not provided a new array will be created.
     *
     * @return {Vec2[]} An array of Point objects pertaining to the points around the circumference of the ellipse.
     */
    static getPoints (ellipse:Ellipse, quantity:number, stepRate:number, out:Vec2[]):Vec2[]{
        if (out === undefined) { out = []; }
        //  If quantity is a falsey value (false, null, 0, undefined, etc) then we calculate it based on the stepRate instead.
        if (!quantity && stepRate > 0){
            quantity = this.circumference(ellipse) / stepRate;
        }

        for (let i:number = 0; i < quantity; i++){
            const angle = MathCommon.fromPercent(i / quantity, 0, MATH_CONST.PI2);
            out.push(this.circumferencePoint(ellipse, angle));
        }

        return out;
    };


    /**
     * Returns a uniformly distributed random point from anywhere within the given Ellipse.
     *
     * @param {Circle} ellipse - The Ellipse to get a random point from.
     * @param {Vec2} [out] - A Point or point-like object to set the random `x` and `y` values in.
     *
     * @return {Vec2} A Point object with the random values set in the `x` and `y` properties.
     */
    static getRandomPoint (ellipse:Ellipse, out:Vec2):Vec2{
        if (out === undefined) { out = new Vec2(); }
        const p:number = Math.random() * MATH_CONST.PI2;
        const s:number = Math.sqrt(Math.random());
        out.x = ellipse.x + ((s * Math.cos(p)) * ellipse.width / 2);
        out.y = ellipse.y + ((s * Math.sin(p)) * ellipse.height / 2);
        return out;
    };

    /**
     * @en Calculate the interpolation result between this circle and another one with given ratio
     * @param out Output rect.
     * @param from Original rect.
     * @param to Target rect.
     * @param ratio The interpolation coefficient.The range is [0,1].
     */
    public static lerp <Out extends IEllipseLike> (out: Out, from: Out, to: Out, ratio: number): Out {
        const x = from.x;
        const y = from.y;
        const w = from.width;
        const h = from.height;
        out.x = x + (to.x - x) * ratio;
        out.y = y + (to.y - y) * ratio;
        out.width = w + (to.width - w) * ratio;
        out.height = h + (to.height - h) * ratio;
        return out;
    }

    /**
     * @en Returns the overlapping portion of 2 circle.
     * @param out Output Rect.
     * @param one One of the specify Circle.
     * @param other Another of the specify Circle.
     */
    public static intersection <Out extends IRectLike> (out: Out, one: Ellipse, other: Ellipse): Out {        
        const axMin = one.x;
        const ayMin = one.y;
        const axMax = one.x + one.width;
        const ayMax = one.y + one.height;
        const bxMin = other.x;
        const byMin = other.y;
        const bxMax = other.x + other.width;
        const byMax = other.y + other.height;
        out.x = Math.max(axMin, bxMin);
        out.y = Math.max(ayMin, byMin);
        out.width = Math.min(axMax, bxMax) - out.x;
        out.height = Math.min(ayMax, byMax) - out.y;
        return out;
    }


    public declare x: number;
    public declare y: number;
    public declare width: number;
    public declare height: number;
    public declare type: number;

    /**
     * @en Constructs a Ellipse from another one.
     * @param other Specified Ellipse.
     */
    constructor (other: Ellipse);

    /**
     * @en Constructs a Ellipse with specified values.
     * @param x The minimum X coordinate of the Ellipse.
     * @param y The minimum Y coordinate of the Ellipse.
     * @param width The width of the Ellipse, measured from the X position.
     * @param height The height of the Ellipse, measured from the Y position.
     */
    constructor (x?: number, y?: number, width?: number, height?:number);

    constructor (x?: Ellipse | number, y?: number, width: number = 0, height:number = 0) {
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
        this.type = GEOM_CONST.ELLIPSE;        
    }

    /**
     * Returns the major radius of the ellipse. Also known as the Semi Major Axis.
     *
     * @return {number} The major radius.
     */
    get majorRadius():number {
        return Math.max(this.width, this.height) / 2;
    }
    
    /**
     * Returns the minor radius of the ellipse. Also known as the Semi Minor Axis.
     *
     * @return {number} The minor radius.
     */
    get minorRadius():number{
        return Math.min(this.width, this.height) / 2;
    }


    /**
     * 
     */
    get left():number{
        return this.x - (this.width / 2);
    }

    set left(value:number){
        this.x = value + (this.width / 2);
    }
    
    get right():number{
        return this.x + (this.width / 2);
    }

    set right(value:number){
        this.x = value - (this.width / 2);
    }
    
    get top():number{
        return this.y + (this.height / 2);
    }

    set top(value:number){
        this.y = value - (this.height / 2);
    }
    
    get bottom():number{
        return this.y - (this.height / 2);
    }

    set bottom(value:number){
        this.y = value + (this.height / 2);
    }

    /**
     * @en Set values with another Ellipse.
     * @param other Specified Ellipse.
     * @returns `this`
     */
    public set (other: Ellipse): any;

    /**
     * @en Set the value of each component of the current Ellipse.
     * @param x The x parameter of the specified Ellipse
     * @param y The y parameter of the specified Ellipse
     * @param width The width parameter of the specified Ellipse
     * @param height The height parameter of the specified Ellipse
     * @returns `this`
     */
    public set (x?: number, y?: number, width?: number, height?: number): any;

    public set (x?: Ellipse | number, y?: number, width?: number, height?: number): any {
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
        return this;
    }

    /**
     * @en clone the current Ellipse.
     */
    public clone (): Ellipse {
        return new Ellipse(this.x, this.y, this.width, this.height);
    }

    /**
     * @en Check whether the current Ellipse equals another one.
     * @param other Specified Ellipses.
     * @returns Returns `true' when the minimum and maximum values of both Ellipses are equal, respectively; otherwise, returns `false'.
     */
    public equals (other: Ellipse): boolean {
        return (
            this.x === other.x &&
            this.y === other.y &&
            this.width === other.width &&
            this.height === other.height
        );
    }

    /**
     * @en Calculate the interpolation result between this Ellipse and another one with given ratio.
     * @param to Target Ellipse.
     * @param ratio The interpolation coefficient.The range is [0,1].
     */
    public lerp (to: Ellipse, ratio: number): Ellipse {
        const x = this.x;
        const y = this.y;
        const w = this.width;
        const h = this.height;
        this.x = x + (to.x - x) * ratio;
        this.y = y + (to.y - y) * ratio;
        this.width = w + (to.width - w) * ratio;
        this.height = h + (to.height - h) * ratio;
        return this;
    }

    /**
     * @en Return the information of the current cỉrcle in string
     * @returns The information of the current cỉrcle in string
     */
    public toString (): string {
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.width.toFixed(2)}, ${this.height.toFixed(2)})`;
    }

    /**
     * @en Check whether the current ellipse intersects with the given one.
     * 
     * @param other Specified Ellipses.
     * @returns If intersected, return `true', otherwise return `false'.
     */
    public intersects (other: Ellipse): boolean {        
        const angle:number = MathAngle.between(this, other);
        const otherPoint:Vec2 = Ellipse.circumferencePoint(other, angle);
        return this.contains(otherPoint);
    }

    /**
     * Check to see if the Ellipse contains the given x / y coordinates.
     *
     * @param {number} x - The x coordinate to check within the ellipse.
     * @param {number} y - The y coordinate to check within the ellipse.
     *
     * @return {boolean} True if the coordinates are within the ellipse, otherwise false.
     */
    contains(point:Vec2):boolean {
        return Ellipse.contains(this, point.x, point.y);
    }
}
