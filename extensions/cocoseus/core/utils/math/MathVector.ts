import { _decorator, Component, IVec2Like, Mat4, Node, Quat, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MathVector')
export class MathVector extends Component {
    /**
     * Compute a random unit vector.
     *
     * Computes random values for the given vector between -1 and 1 that can be used to represent a direction.
     *
     * Optionally accepts a scale value to scale the resulting vector by.
     *
     * @param {Vec2|Vec3} vector - The Vector to compute random values for.
     * @param {number} [scaleOrRadius=1] - The scale of the random values.
     *
     * @return {Vec2} The given Vector.
     */
    static random(vector:Vec2|Vec3, scaleOrRadius:number = 1):Vec2|Vec3{
        if(vector instanceof Vec2){
            if (scaleOrRadius === undefined) { scaleOrRadius = 1; }
            const r = Math.random() * 2 * Math.PI;
            vector.x = Math.cos(r) * scaleOrRadius;
            vector.y = Math.sin(r) * scaleOrRadius;
        }else{
            if (scaleOrRadius === undefined) { scaleOrRadius = 1; }
            const r = Math.random() * 2 * Math.PI;
            const z = (Math.random() * 2) - 1;
            const zScale = Math.sqrt(1 - z * z) * scaleOrRadius;
            vector.x = Math.cos(r) * zScale;
            vector.y = Math.sin(r) * zScale;
            vector.z = z * scaleOrRadius;
        }
        return vector;
    };

    /**
     * Interpolates two given Vectors and returns a new Vector between them.
     *
     * Does not modify either of the passed Vectors.
     *
     * @param {Vec3} vector1 - Starting vector
     * @param {Vec3} vector2 - Ending vector
     * @param {number} [t=0] - The percentage between vector1 and vector2 to return, represented as a number between 0 and 1.
     *
     * @return {Vec3} The step t% of the way between vector1 and vector2.
     */
    static linearVector(vector1:Vec3, vector2:Vec3, t:number):Vec3{
        if (t === undefined) { t = 0; }        
        return vector1.clone().lerp(vector2, t);
    };


    /**
     * Rotate a given point by a given angle around the origin (0, 0), in an anti-clockwise direction.
     *
     * @param {Vec2|Vec3} vector - The point to be rotated.
     * @param {number} angle - The angle to be rotated by in an anticlockwise direction.
     *
     * @return {Vec2|Vec3} The given point, rotated by the given angle in an anticlockwise direction.
     */
    static rotate (vector:Vec2|Vec3, angle:number):Vec2|Vec3{
        const x = vector.x;
        const y = vector.y;
        vector.x = (x * Math.cos(angle)) - (y * Math.sin(angle));
        vector.y = (x * Math.sin(angle)) + (y * Math.cos(angle));
        return vector;
    };


    /**
     * Rotate a `point` around `x` and `y` to the given `angle`, at the same distance.
     *
     * In polar notation, this maps a point from (r, t) to (r, angle), vs. the origin (x, y).
     * 
     * @param {Vec2|Vec3} vector - The point to be rotated.
     * @param {number} x - The horizontal coordinate to rotate around.
     * @param {number} y - The vertical coordinate to rotate around.
     * @param {number} angle - The angle of rotation in radians.
     *
     * @return {Vec2|Vec3} The given point.
     */
    static rotateAround(vector:Vec2|Vec3, x:number, y:number, angle:number):Vec2|Vec3 {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const tx = vector.x - x;
        const ty = vector.y - y;
        vector.x = tx * c - ty * s + x;
        vector.y = tx * s + ty * c + y;
        return vector;
    };

    /**
     * Rotate a `point` around `x` and `y` by the given `angle` and `distance`.
     *
     * In polar notation, this maps a point from (r, t) to (distance, t + angle), vs. the origin (x, y).
     *
     * @param {Vec2|Vec3} vector - The point to be rotated.
     * @param {number} x - The horizontal coordinate to rotate around.
     * @param {number} y - The vertical coordinate to rotate around.
     * @param {number} angle - The angle of rotation in radians.
     * @param {number} distance - The distance from (x, y) to place the point at.
     *
     * @return {Vec2|Vec3} The given point.
     */
    static rotateAroundDistance (vector:Vec2|Vec3, x:number, y:number, angle:number, distance:number):Vec2|Vec3 {
        const t = angle + Math.atan2(vector.y - y, vector.x - x);
        vector.x = x + (distance * Math.cos(t));
        vector.y = y + (distance * Math.sin(t));
        return vector;
    };

    /**
     * Position a `point` at the given `angle` and `distance` to (`x`, `y`).
     *
     * @param {Vec2|Vec3} vector - The point to be positioned.
     * @param {number} x - The horizontal coordinate to position from.
     * @param {number} y - The vertical coordinate to position from.
     * @param {number} angle - The angle of rotation in radians.
     * @param {number} distance - The distance from (x, y) to place the point at.
     *
     * @return {Vec2|Vec3} The given point.
     */
    static rotateTo (vector:Vec2|Vec3, x:number, y:number, angle:number, distance:number):Vec2|Vec3 {
        vector.x = x + (distance * Math.cos(angle));
        vector.y = y + (distance * Math.sin(angle));
        return vector;
    };

    /**
     * Rotates a vector in place by axis angle.
     *
     * This is the same as transforming a point by an
     * axis-angle quaternion, but it has higher precision.
     *
     * @param {Vec3} vec - The vector to be rotated.
     * @param {Vec3} axis - The axis to rotate around.
     * @param {number} radians - The angle of rotation in radians.
     *
     * @return {Vec3} The given vector.
     */
    static rotateVec3 (vec:Vec3, axis:Vec3, radians:number):Vec3{   
        const halfRad:number = radians * 0.5
        const sinRad = Math.sin(halfRad);
        const mat4:Mat4 = new Mat4();
        //  Set the quaternion to our axis angle
        const quat:Quat = new Quat(sinRad * axis.x, sinRad * axis.y, sinRad * axis.z, Math.cos(halfRad));
        mat4.fromQuat(quat)
        //  Create a rotation matrix from the axis angle
        //  Multiply our vector by the rotation matrix    
        return vec.transformMat4(mat4);
    };


    /**
     * Takes the `x` and `y` coordinates and transforms them into the same space as
     * defined by the position, rotation and scale values.
     *
     * @param {number} x - The x coordinate to be transformed.
     * @param {number} y - The y coordinate to be transformed.
     * @param {number} positionX - Horizontal position of the transform point.
     * @param {number} positionY - Vertical position of the transform point.
     * @param {number} rotation - Rotation of the transform point, in radians.
     * @param {number} scaleX - Horizontal scale of the transform point.
     * @param {number} scaleY - Vertical scale of the transform point.
     * @param {Vec2} [output] - The output vector, point or object for the translated coordinates.
     *
     * @return {Vec2} The translated point.
     */
    static transformVector2D(x:number, y:number, positionX:number, positionY:number, rotation:number, scaleX:number, scaleY:number, output?:Vec2):Vec2
    {
        if (output === undefined) { output = new Vec2();}
        const radianSin = Math.sin(rotation);
        const radianCos = Math.cos(rotation);

        // Rotate and Scale
        const a:number = radianCos * scaleX;
        const b:number = radianSin * scaleX;
        const c:number = -radianSin * scaleY;
        const d:number = radianCos * scaleY;

        //  Invert
        const id:number = 1 / ((a * d) + (c * -b));

        output.x = (d * id * x) + (-c * id * y) + (((positionY * c) - (positionX * d)) * id);
        output.y = (a * id * y) + (-b * id * x) + (((-positionY * a) + (positionX * b)) * id);

        return output;
    };


    

}


