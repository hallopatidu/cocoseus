import { _decorator, IRectLike, Rect, Vec2, Vec3 } from 'cc';
import { Circle } from './Circle';
import { MathCommon } from './MathCommon';
import { MATH_CONST } from './Const';
const { ccclass, property } = _decorator;

@ccclass('MathGeom')
export class MathGeom {

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

        for (var i = 0; i < quantity; i++)
        {
            const angle = MathCommon.fromPercent(i / quantity, 0, MATH_CONST.PI2);

            out.push(this.circumferencePoint(circle, angle));
        }

        return out;
    };


}


