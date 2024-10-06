import { _decorator, Component, Node, ValueType } from 'cc';
const { ccclass, property } = _decorator;
import { IRectLike, IVec2Like, Rect, Vec2 } from "cc";
import { MathCommon } from '../math/MathCommon';
import { GEOM_CONST, MATH_CONST } from '../math/Const';
import { MathDistance } from '../math/MathDistance';

export interface ICircleLike {
    x: number;
    y: number;
    radius:number
}

@ccclass('Circle')
export class Circle extends ValueType {

    /**
     * Returns the circumference of the given Circle.
     *
     * @param {Circle} circle - The Circle to get the circumference of.
     *
     * @return {number} The circumference of the Circle.
     */
    static circumference (circle:Circle):number {
        return 2 * (Math.PI * circle.radius);
    };

    /**
     * Calculates the area of the circle.
     *
     * @param {Circle} circle - The Circle to get the area of.
     *
     * @return {number} The area of the Circle.
     */
    static area (circle:Circle):number
    {
        return (circle.radius > 0) ? Math.PI * circle.radius * circle.radius : 0;
    };


    /**
     * Returns a Point object containing the coordinates of a point on the circumference of the Circle based on the given angle.
     *
     * @param {Circle} circle - The Circle to get the circumference point on.
     * @param {number} angle - The angle from the center of the Circle to the circumference to return the point from. Given in radians.
     * @param {Vec2} [out] - A Point, or point-like object, to store the results in. If not given a Point will be created.
     *
     * @return {Vec2} A Point object where the `x` and `y` properties are the point on the circumference.
     */
    static circumferencePoint(circle:Circle, angle:number, out?:Vec2):Vec2 {
        if (out === undefined) { out = new Vec2(); };
        out.x = circle.x + (circle.radius * Math.cos(angle));
        out.y = circle.y + (circle.radius * Math.sin(angle));
        return out;
    };


    /**
     * Check to see if the Circle contains the given x / y coordinates.
     *
     * @param {Circle} circle - The Circle to check.
     * @param {number} x - The x coordinate to check within the circle.
     * @param {number} y - The y coordinate to check within the circle.
     *
     * @return {boolean} True if the coordinates are within the circle, otherwise false.
     */
    static contains(circle:Circle, x:number, y:number):boolean{
        if(circle instanceof Circle){
            //  Check if x/y are within the bounds first
            if (circle.radius > 0 && x >= circle.left && x <= circle.right && y >= circle.top && y <= circle.bottom)
            {
                const dx = (circle.x - x) * (circle.x - x);
                const dy = (circle.y - y) * (circle.y - y);
                return (dx + dy) <= (circle.radius * circle.radius);
            }
            else
            {
                return false;
            }
        }
    };


    /**
     * Check to see if the Circle contains the given Point object.
     *
     * @param {Circle} circle - The Circle to check.
     * @param {Vec2} point - The Point object to check if it's within the Circle or not.
     *
     * @return {boolean} True if the Point coordinates are within the circle, otherwise false.
     */
    static containsPoint (circle:Circle, point:Vec2):boolean
    {
        return this.contains(circle, point.x, point.y);
    };


    /**
     * Check to see if the Circle contains all four points of the given Rectangle object.
     *
     * @param {Circle} circle - The Circle to check.
     * @param {Rect} rect - The Rectangle object to check if it's within the Circle or not.
     *
     * @return {boolean} True if all of the Rectangle coordinates are within the circle, otherwise false.
     */
    static containsRect (circle:Circle, rect:Rect):boolean
    {
        return (
            this.contains(circle, rect.x, rect.y) &&
            this.contains(circle, rect.xMax, rect.y) &&
            this.contains(circle, rect.x, rect.yMin) &&
            this.contains(circle, rect.xMax, rect.yMin)
        );
    };

    /**
     * Copies the `x`, `y` and `radius` properties from the `source` Circle
     * into the given `dest` Circle, then returns the `dest` Circle.
     *
     * @generic { Circle} O - [dest,$return]
     *
     * @param { Circle} source - The source Circle to copy the values from.
     * @param { Circle} dest - The destination Circle to copy the values to.
     *
     * @return { Circle} The destination Circle.
     */
    static copyFrom(source:Circle, dest:Circle):Circle
    {
        return dest.set(source.x, source.y, source.radius);
    };


    /**
     * Returns the bounds of the Circle object.
     *
     * @param { Circle} circle - The Circle to get the bounds from.
     * @param {( Rectangle|object)} [out] - A Rectangle, or rectangle-like object, to store the circle bounds in. If not given a new Rectangle will be created.
     *
     * @return {( Rectangle|object)} The Rectangle object containing the Circles bounds.
     */
    static getBounds(circle:Circle, out:Rect):Rect {
        if (out === undefined) { out = new Rect(); }
        out.x = circle.left;
        out.y = circle.top;
        out.width = circle.radius*2;
        out.height = circle.radius*2;
        return out;
    };

    /**
     * Returns a Point object containing the coordinates of a point on the circumference of the Circle
     * based on the given angle normalized to the range 0 to 1. I.e. a value of 0.5 will give the point
     * at 180 degrees around the circle.
     *
     * @function Phaser.Geom.Circle.GetPoint
     * @since 3.0.0
     *
     * @generic {Phaser.Geom.Point} O - [out,$return]
     *
     * @param {Circle} circle - The Circle to get the circumference point on.
     * @param {number} position - A value between 0 and 1, where 0 equals 0 degrees, 0.5 equals 180 degrees and 1 equals 360 around the circle.
     * @param {Vec2} [out] - An object to store the return values in. If not given a Point object will be created.
     *
     * @return {Vec2} A Point, or point-like object, containing the coordinates of the point around the circle.
     */
    static getPoint(circle:Circle, position:number, out:Vec2):Vec2 {
        if (out === undefined) { out = new Vec2(); }

        const angle = MathCommon.fromPercent(position, 0, MATH_CONST.PI2);

        return this.circumferencePoint(circle, angle, out);
    };


    /**
     * Returns an array of Point objects containing the coordinates of the points around the circumference of the Circle,
     * based on the given quantity or stepRate values.
     *
     * @param {Circle} circle - The Circle to get the points from.
     * @param {number} quantity - The amount of points to return. If a falsey value the quantity will be derived from the `stepRate` instead.
     * @param {number} [stepRate] - Sets the quantity by getting the circumference of the circle and dividing it by the stepRate.
     * @param {Vec2[]} [output] - An array to insert the points in to. If not provided a new array will be created.
     *
     * @return {Vec2[]} An array of Point objects pertaining to the points around the circumference of the circle.
     */
    static getPoints (circle:Circle, quantity:number, stepRate:number, out:Vec2[]):Vec2[]{
        if (out === undefined) { out = []; }
        //  If quantity is a falsey value (false, null, 0, undefined, etc) then we calculate it based on the stepRate instead.
        if (!quantity && stepRate > 0) {
            quantity = this.circumference(circle) / stepRate;
        }

        for (let i:number = 0; i < quantity; i++)
        {
            const angle = MathCommon.fromPercent(i / quantity, 0, MATH_CONST.PI2);
            out.push(this.circumferencePoint(circle, angle));
        }

        return out;
    };


    /**
     * Returns a uniformly distributed random point from anywhere within the given Circle.
     *
     * @param {Circle} circle - The Circle to get a random point from.
     * @param {Vec2} [out] - A Point or point-like object to set the random `x` and `y` values in.
     *
     * @return {Vec2} A Point object with the random values set in the `x` and `y` properties.
     */
    static getRandomPoint (circle:Circle, out:Vec2):Vec2{
        if (out === undefined) { out = new Vec2(); }

        const t = 2 * Math.PI * Math.random();
        const u = Math.random() + Math.random();
        const r = (u > 1) ? 2 - u : u;
        const x = r * Math.cos(t);
        const y = r * Math.sin(t);

        out.x = circle.x + (x * circle.radius);
        out.y = circle.y + (y * circle.radius);

        return out;
    };

    /**
     * @en Creates a circle from two coordinate values.
     * @param v1 Specified point 1.
     * @param v2 Specified point 2.
     * @returns Target rectangle.
     */
    public static fromMinMax<Out extends ICircleLike, VecLike extends IVec2Like> (out: Out, v1: VecLike, v2: VecLike): Out {
        out.x = MathCommon.average([v1.x,v2.x]);
        out.y = MathCommon.average([v1.y,v2.y]);
        out.radius = MathDistance.distanceBetween(v1.x,v1.y,v2.x,v2.y)/2;
        return out;
    }

    /**
     * @en Calculate the interpolation result between this circle and another one with given ratio
     * @param out Output rect.
     * @param from Original rect.
     * @param to Target rect.
     * @param ratio The interpolation coefficient.The range is [0,1].
     */
    public static lerp <Out extends ICircleLike> (out: Out, from: Out, to: Out, ratio: number): Out {
        const x = from.x;
        const y = from.y;
        const r = from.radius;
        out.x = x + (to.x - x) * ratio;
        out.y = y + (to.y - y) * ratio;
        out.radius = r + (to.radius - r) * ratio;
        return out;
    }

    /**
     * [Underconstructor]
     * @en Returns the overlapping portion of 2 circle.
     * @param out Output Rect.
     * @param one One of the specify Circle.
     * @param other Another of the specify Circle.
     */
    public static intersection <Out extends IRectLike> (out: Out, one: Circle, other: Circle): Out {        
        const axMin = one.x;
        const ayMin = one.y;
        const axMax = one.x + one.radius;
        const ayMax = one.y + one.radius;
        const bxMin = other.x;
        const byMin = other.y;
        const bxMax = other.x + other.radius;
        const byMax = other.y + other.radius;
        out.x = Math.max(axMin, bxMin);
        out.y = Math.max(ayMin, byMin);
        out.width = Math.min(axMax, bxMax) - out.x;
        out.height = Math.min(ayMax, byMax) - out.y;
        return out;
    }

    public declare x: number;
    public declare y: number;
    public declare radius: number;
    public declare type: number;
    
    /**
     * @en Constructs a Circle from another one.
     * @param other Specified Circle.
     */
    constructor (other: Circle);

    /**
     * @en Constructs a Circle with specified values.
     * @param x The minimum X coordinate of the circle.
     * @param y The minimum Y coordinate of the circle.
     * @param width The width of the circle, measured from the X position.
     * @param height The height of the circle, measured from the Y position.
     */
    constructor (x?: number, y?: number, radius?: number);

    constructor (x?: Circle | number, y?: number, radius?: number) {
        super();
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
            this.radius = x.radius;
        } else {
            this.x = x || 0;
            this.y = y || 0;
            this.radius = radius || 0;
        }
        this.type = GEOM_CONST.CIRCLE;
    }


    get left():number{
        return this.x - this.radius;
    }

    set left(value:number){
        this.x = value + this.radius;
    }
    
    get right():number{
        return this.x + this.radius;
    }

    set right(value:number){
        this.x = value - this.radius;
    }
    
    get top():number{
        return this.y + this.radius;
    }

    set top(value:number){
        this.y = value - this.radius;
    }
    
    get bottom():number{
        return this.y - this.radius;
    }

    set bottom(value:number){
        this.y = value + this.radius;
    }


    /**
     * @en clone the current Circle.
     */
    public clone (): Circle {
        return new Circle(this.x, this.y, this.radius);
    }


    /**
     * @en Set values with another Circle.
     * @param other Specified Circle.
     * @returns `this`
     */
    public set (other: Circle): any;

    /**
     * @en Set the value of each component of the current Circle.
     * @param x The x parameter of the specified circle
     * @param y The y parameter of the specified circle
     * @param width The width parameter of the specified circle
     * @param height The height parameter of the specified circle
     * @returns `this`
     */
    public set (x?: number, y?: number, radius?: number): any;

    public set (x?: Circle | number, y?: number, radius?: number): any {
        if (typeof x === 'object') {
            this.x = x.x;
            this.y = x.y;
            this.radius = x.radius;
        } else {
            this.x = x || 0;
            this.y = y || 0;
            this.radius = this.radius || 0;
        }
        return this;
    }

    /**
     * @en Check whether the current Circle equals another one.
     * @param other Specified circles.
     * @returns Returns `true' when the minimum and maximum values of both circles are equal, respectively; otherwise, returns `false'.
     */
    public equals (other: Circle): boolean {
        return this.x === other.x
            && this.y === other.y
            && this.radius === other.radius
    }

    /**
     * @en Calculate the interpolation result between this Circle and another one with given ratio.
     * @param to Target Circle.
     * @param ratio The interpolation coefficient.The range is [0,1].
     */
    public lerp (to: Circle, ratio: number): Circle {
        const x = this.x;
        const y = this.y;
        const r = this.radius;
        this.x = x + (to.x - x) * ratio;
        this.y = y + (to.y - y) * ratio;
        this.radius = r + (to.radius - r) * ratio;
        return this;
    }

    /**
     * @en Return the information of the current cỉrcle in string
     * @returns The information of the current cỉrcle in string
     */
    public toString (): string {
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.radius.toFixed(2)})`;
    }

    /**
     * @en Check whether the current circle intersects with the given one.
     * @param other Specified circles.
     * @returns If intersected, return `true', otherwise return `false'.
     */
    public intersects (other: Circle): boolean {
        return MathDistance.distanceBetween(this.x, this.y, other.x, other.y) <= (this.radius + other.radius);
    }


    /**
     * @en Check whether the current circle contains the given point.
     * @param point Specified point.
     * @returns The specified point is included in the rectangle and returns `true', otherwise it returns `false'.
     */
    public contains (point: Vec2): boolean {
        return MathDistance.distanceBetween(this.x, this.y, point.x, point.y) <= this.radius;
    }


    /**
     * @en Returns true if the other rect entirely inside this rectangle.
     * @param other Specified rectangles.
     * @returns Returns `true' if all the points of the specified rectangle are included in the current rectangle, `false' otherwise.
     */
    public containsCircle (other: Circle): boolean {
        return MathDistance.distanceBetween(this.x, this.y, other.x, other.y) + other.radius <= this.radius;
    }

}

/**
 * @en The convenient method to create a new Rect.
 * @param rect Specified Rect.
 * @returns `new Rect(rect)`
 */
export function circle (rect: Circle): Circle;

/**
 * @en The convenient method to create a new Rect.
 * @param x The minimum X coordinate of the rectangle.
 * @param y The minimum Y coordinate of the rectangle.
 * @param width The width of the rectangle, measured from the X position.
 * @param height The height of the rectangle, measured from the Y position.
 * @returns `new Rect(x, y, width, height)`
 */
export function circle (x?: number, y?: number, radius?:number): Circle;

export function circle (x: Circle | number = 0, y = 0, radius:number = 0): Circle {
    return new Circle(x as any, y, radius);
}


