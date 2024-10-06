import { _decorator, Component, IVec2Like, Node, Rect, Vec2 } from 'cc';
import { Circle } from '../geom/Circle';
import { MathDistance } from './MathDistance';
const { ccclass, property } = _decorator;

@ccclass('MathIntersection')
export class MathIntersection {
    /**
     * Checks if two Circles intersect.
     *
     * @param {Circle} circleA - The first Circle to check for intersection.
     * @param {Circle} circleB - The second Circle to check for intersection.
     *
     * @return {boolean} `true` if the two Circles intersect, otherwise `false`.
     */
    static circleToCircle (circleA:Circle, circleB:Circle):boolean{
        return MathDistance.distanceBetween(circleA.x, circleA.y, circleB.x, circleB.y) <= (circleA.radius + circleB.radius);
    };

    

    /**
     * Checks if two Circles intersect and returns the intersection points as a Point object array.
     *
     * @param {Circle} circleA - The first Circle to check for intersection.
     * @param {Circle} circleB - The second Circle to check for intersection.
     * @param {IVec2Like[]} [out] - An optional array in which to store the points of intersection.
     *
     * @return {Vec2[]} An array with the points of intersection if objects intersect, otherwise an empty array.
     */
    static getCircleToCirclePoints(circleA:Circle, circleB:Circle, out?:IVec2Like[]):Vec2[] {
        if (out === undefined) { out = []; }
        if (this.circleToCircle(circleA, circleB)){
            const x0 = circleA.x;
            const y0 = circleA.y;
            const r0 = circleA.radius;
            const x1 = circleB.x;
            const y1 = circleB.y;
            const r1 = circleB.radius;

            let coefficientA:number, coefficientB:number, coefficientC:number, lambda:number, x:number;

            if (y0 === y1)
            {
                x = ((r1 * r1) - (r0 * r0) - (x1 * x1) + (x0 * x0)) / (2 * (x0 - x1));

                coefficientA = 1;
                coefficientB = -2 * y1;
                coefficientC = (x1 * x1) + (x * x) - (2 * x1 * x) + (y1 * y1) - (r1 * r1);

                lambda = (coefficientB * coefficientB) - (4 * coefficientA * coefficientC);

                if (lambda === 0)
                {
                    out.push(new Vec2(x, (-coefficientB / (2 * coefficientA))));
                }
                else if (lambda > 0)
                {
                    out.push(new Vec2(x, (-coefficientB + Math.sqrt(lambda)) / (2 * coefficientA)));
                    out.push(new Vec2(x, (-coefficientB - Math.sqrt(lambda)) / (2 * coefficientA)));
                }
            }
            else
            {
                const v1:number = (x0 - x1) / (y0 - y1);
                const n:number = (r1 * r1 - r0 * r0 - x1 * x1 + x0 * x0 - y1 * y1 + y0 * y0) / (2 * (y0 - y1));

                coefficientA = (v1 * v1) + 1;
                coefficientB = (2 * y0 * v1) - (2 * n * v1) - (2 * x0);
                coefficientC = (x0 * x0) + (y0 * y0) + (n * n) - (r0 * r0) - (2 * y0 * n);

                lambda = (coefficientB * coefficientB) - (4 * coefficientA * coefficientC);

                if (lambda === 0){
                    x = (-coefficientB / (2 * coefficientA));
                    out.push(new Vec2(x, (n - (x * v1))));

                }else if (lambda > 0){
                    x = (-coefficientB + Math.sqrt(lambda)) / (2 * coefficientA);
                    out.push(new Vec2(x, (n - (x * v1))));
                    x = (-coefficientB - Math.sqrt(lambda)) / (2 * coefficientA);
                    out.push(new Vec2(x, (n - (x * v1))));
                }
            }
        }

        return out as Vec2[];
    };

    /**
     * Checks for intersection between a circle and a rectangle.
     *
     * @param {Circle} circle - The circle to be checked.
     * @param {Rect} rect - The rectangle to be checked.
     *
     * @return {boolean} `true` if the two objects intersect, otherwise `false`.
     */
    static circleToRect(circle:Circle, rect:Rect):boolean {
        const halfWidth = rect.width / 2;
        const halfHeight = rect.height / 2;
        const cx = Math.abs(circle.x - rect.x - halfWidth);
        const cy = Math.abs(circle.y - rect.y - halfHeight);
        const xDist = halfWidth + circle.radius;
        const yDist = halfHeight + circle.radius;
        // 
        if (cx > xDist || cy > yDist){
            return false;
        }else if (cx <= halfWidth || cy <= halfHeight){
            return true;
        }else{
            const xCornerDist = cx - halfWidth;
            const yCornerDist = cy - halfHeight;
            const xCornerDistSq = xCornerDist * xCornerDist;
            const yCornerDistSq = yCornerDist * yCornerDist;
            const maxCornerDistSq = circle.radius * circle.radius;
            return (xCornerDistSq + yCornerDistSq <= maxCornerDistSq);
        }
    };

    /**
     * [Underconstructor]
     * Checks for intersection between a circle and a rectangle,
     * and returns the intersection points as a Point object array.
     *
     * @function Phaser.Geom.Intersects.GetCircleToRectangle
     * @since 3.0.0
     *
     * @param {Circle} circle - The circle to be checked.
     * @param {Rect} rect - The rectangle to be checked.
     * @param {array} [out] - An optional array in which to store the points of intersection.
     *
     * @return {array} An array with the points of intersection if objects intersect, otherwise an empty array.
     */
    static getCircleToRectanglePoints(circle:Circle, rect:Rect, out)
    {
        // if (out === undefined) { out = []; }

        // if (this.circleToRect(circle, rect))
        // {
        //     var lineA = rect.getLineA();
        //     var lineB = rect.getLineB();
        //     var lineC = rect.getLineC();
        //     var lineD = rect.getLineD();

        //     GetLineToCircle(lineA, circle, out);
        //     GetLineToCircle(lineB, circle, out);
        //     GetLineToCircle(lineC, circle, out);
        //     GetLineToCircle(lineD, circle, out);
        // }

        return out;
    };

}


