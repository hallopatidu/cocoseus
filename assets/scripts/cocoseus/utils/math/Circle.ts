import { IRectLike, IVec2Like, Rect, ValueType, Vec2 } from "cc";
import { MathCommon } from "./MathCommon";
import { MathVector } from "./MathVector";
import { MathDistance } from "./MathDistance";

export interface ICircleLike {
    x: number;
    y: number;
    radius:number
}

// @cclass
export class Circle extends ValueType {

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
        return this.y - this.radius;
    }

    set top(value:number){
        this.y = value + this.radius;
    }
    
    get bottom():number{
        return this.y + this.radius;
    }

    set bottom(value:number){
        this.y = value - this.radius;
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


