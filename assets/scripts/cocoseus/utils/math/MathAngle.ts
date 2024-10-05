import { _decorator, Component, IVec2Like, IVec3Like, Node } from 'cc';
import { MATH_CONST } from './Const';
import { MathCommon } from './MathCommon';
const { ccclass, property } = _decorator;

@ccclass('MathAngle')
export class MathAngle extends Component {

    /**
     * Find the angle of a segment from (firstPosition.x, firstPosition.y) -> (secondPosition.x, secondPosition.y).
     *
     * Calculates the angle of the vector from the first point to the second point.
     * @param firstPosition 
     * @param secondPosition 
     * @returns 
     */
    static between(firstPosition:IVec3Like|IVec2Like, secondPosition:IVec3Like|IVec2Like):number{  
        return Math.atan2(secondPosition.y - firstPosition.y, secondPosition.x - firstPosition.x);
    }


    static betweenY(firstPosition:IVec3Like|IVec2Like, secondPosition:IVec3Like|IVec2Like):number{          
        return Math.atan2(secondPosition.x - firstPosition.x, secondPosition.y - firstPosition.y);
    }
    
    /**
     * Takes an angle in default clockwise format and converts it so that
     * 0 is North, 90 is West, 180 is South and 270 is East,
     * therefore running counter-clockwise instead of clockwise.
     * 
     * @param {number} radianAngle  The angle to convert, in radians.
     * @returns {number} The converted angle, in radians.
     */
    static counterClockwise(radianAngle:number):number{
        if (radianAngle > Math.PI)
        {
            radianAngle -= MATH_CONST.PI2;
        }
    
        return Math.abs((((radianAngle + MATH_CONST.TAU) % MATH_CONST.PI2) - MATH_CONST.PI2) % MATH_CONST.PI2);
    }

    /**
     * Normalize an angle to the [0, 2pi] range.
     * @param {number} radianAngle  The angle to convert, in radians.
     * @returns {number} The converted angle, in radians.
     */
    static normalize(radianAngle:number){
        radianAngle = radianAngle % (2 * Math.PI);

        if (radianAngle >= 0)
        {
            return radianAngle;
        }
        else
        {
            return radianAngle + 2 * Math.PI;
        }
    }

    /**
     * Convert the given angle from degrees, to the equivalent angle in radians.
     *
     * @param {number} degrees - The angle (in degrees) to convert to radians.
     *
     * @return {number} The given angle converted to radians.
     */    
    static degToRad (degrees:number):number{
        return degrees * MATH_CONST.DEG_TO_RAD;
    };

    /**
     * Convert the given angle in radians, to the equivalent angle in degrees.
     *
     * @param {number} radians - The angle in radians to convert ot degrees.
     *
     * @return {number} The given angle converted to degrees.
     */
    static radToDeg (radians:number):number
    {
        return radians * MATH_CONST.RAD_TO_DEG;
    };


    /**
     * Returns a random angle in the range [-pi, pi].
     *
     * @return {number} The angle, in radians.
     */
    static randomRad():number{
        return MathCommon.between(-Math.PI, Math.PI);
    };

    /**
     * Returns a random angle in the range [-pi, pi].
     *
     * @return {number} The angle, in radians.
     */
    static randomDeg():number{
        return MathCommon.between(-180, 180);
    };


    /**
     * Reverse the given angle.
     *
     * @param {number} angle - The angle to reverse, in radians.
     *
     * @return {number} The reversed angle, in radians.
     */
    static reverse (angle:number):number
    {
        return this.normalize(angle + Math.PI);
    };


    /**
     * Rotates `currentAngle` towards `targetAngle`, taking the shortest rotation distance. The `lerp` argument is the amount to rotate by in this call.
     *
     * @param {number} currentAngle - The current angle, in radians.
     * @param {number} targetAngle - The target angle to rotate to, in radians.
     * @param {number} [lerp=0.05] - The lerp value to add to the current angle.
     *
     * @return {number} The adjusted angle.
     */
    static rotateTo(currentAngle:number, targetAngle:number, lerp:number = 0.5):number{
        if (lerp === undefined) { lerp = 0.05; }

        if (currentAngle === targetAngle)
        {
            return currentAngle;
        }

        if (Math.abs(targetAngle - currentAngle) <= lerp || Math.abs(targetAngle - currentAngle) >= (MATH_CONST.PI2 - lerp))
        {
            currentAngle = targetAngle;
        }
        else
        {
            if (Math.abs(targetAngle - currentAngle) > Math.PI)
            {
                if (targetAngle < currentAngle)
                {
                    targetAngle += MATH_CONST.PI2;
                }
                else
                {
                    targetAngle -= MATH_CONST.PI2;
                }
            }

            if (targetAngle > currentAngle)
            {
                currentAngle += lerp;
            }
            else if (targetAngle < currentAngle)
            {
                currentAngle -= lerp;
            }
        }

        return currentAngle;
    };


    /**
     * Gets the shortest angle between `angle1` and `angle2`.
     *
     * Both angles must be in the range -180 to 180, which is the same clamped
     * range that `sprite.angle` uses, so you can pass in two sprite angles to
     * this method and get the shortest angle back between the two of them.
     *
     * The angle returned will be in the same range. If the returned angle is
     * greater than 0 then it's a counter-clockwise rotation, if < 0 then it's
     * a clockwise rotation.
     *
     * @param {number} angle1 - The first angle in the range -180 to 180.
     * @param {number} angle2 - The second angle in the range -180 to 180.
     *
     * @return {number} The shortest angle, in degrees. If greater than zero it's a counter-clockwise rotation.
     */
    static shortestBetween(angle1:number, angle2:number):number
    {
        const difference = angle2 - angle1;
        if (difference === 0) return 0;
        const times = Math.floor((difference - (-180)) / 360);
        return difference - (times * 360);
    };

    /**
     * Wrap an angle.
     *
     * Wraps the angle to a value in the range of -PI to PI.
     *
     * @param {number} angle - The angle to wrap, in radians.
     *
     * @return {number} The wrapped angle, in radians.
     */
    static wrapRadian(angle:number):number
    {
        return MathCommon.wrap(angle, -Math.PI, Math.PI);
    };

    /**
     * Wrap an angle.
     *
     * Wraps the angle to a value in the range of -180 to 180.
     *
     * @param {number} angle - The angle to wrap, in degrees.
     *
     * @return {number} The wrapped angle, in degrees.
     */
    static wrapDegrees(angle:number):number
    {
        return MathCommon.wrap(angle,  -180, 180);
    };


}


