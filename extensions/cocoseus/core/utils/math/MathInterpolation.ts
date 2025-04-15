import { _decorator, Component, Node } from 'cc';
import { MathCommon } from './MathCommon';
const { ccclass, property } = _decorator;

@ccclass('MathInterpolation')
export class MathInterpolation {
    
    /**
     * A bezier interpolation method.
     *
     * @param {number[]} values - The input array of values to interpolate between.
     * @param {number} k - The percentage of interpolation, between 0 and 1.
     *
     * @return {number} The interpolated value.
     */
    static bezierInterpolation(values:number[], k:number):number
    {
        var b = 0;
        var n = values.length - 1;

        for (var i = 0; i <= n; i++)
        {
            b += Math.pow(1 - k, n - i) * Math.pow(k, i) * values[i] * MathCommon.bernstein(n, i);
        }

        return b;
    };

    /**
     * A Catmull-Rom interpolation method.
     *
     * @param {number[]} values - The input array of values to interpolate between.
     * @param {number} k - The percentage of interpolation, between 0 and 1.
     *
     * @return {number} The interpolated value.
     */
    static catmullRomInterpolation(values:number[], k:number):number{
        var m = values.length - 1;
        var f = m * k;
        var i = Math.floor(f);

        if (values[0] === values[m])
        {
            if (k < 0)
            {
                i = Math.floor(f = m * (1 + k));
            }

            return MathCommon.catmullRom(f - i, values[(i - 1 + m) % m], values[i], values[(i + 1) % m], values[(i + 2) % m]);
        }
        else
        {
            if (k < 0)
            {
                return values[0] - (MathCommon.catmullRom(-f, values[0], values[0], values[1], values[1]) - values[0]);
            }

            if (k > 1)
            {
                return values[m] - (MathCommon.catmullRom(f - m, values[m], values[m], values[m - 1], values[m - 1]) - values[m]);
            }

            return MathCommon.catmullRom(f - i, values[i ? i - 1 : 0], values[i], values[m < i + 1 ? m : i + 1], values[m < i + 2 ? m : i + 2]);
        }
    };
    

    /**
     * A cubic bezier interpolation method.
     *
     * @see {@link https://medium.com/@adrian_cooney/bezier-interpolation-13b68563313a}
     *
     * @param {number} t - The percentage of interpolation, between 0 and 1.
     * @param {number} p0 - The start point.
     * @param {number} p1 - The first control point.
     * @param {number} p2 - The second control point.
     * @param {number} p3 - The end point.
     *
     * @return {number} The interpolated value.
     */
    static cubicBezierInterpolation(t:number, p0:number, p1:number, p2:number, p3:number)
    {
        const k = 1 - t;
        const calP0 = k * k * k * p0;
        const calP1 = 3 * k * k * t * p1;
        const calP2 =  3 * (1 - t) * t * t * p2;
        const calP3 =  t * t * t * p3;
        return calP0 + calP1 + calP2 + calP3;
    };


    /**
     * A linear interpolation method.
     * @see {@link https://en.wikipedia.org/wiki/Linear_interpolation}
     *
     * @param {number[]} values - The input array of values to interpolate between.
     * @param {!number} k - The percentage of interpolation, between 0 and 1.
     *
     * @return {!number} The interpolated value.
     */
    static linearInterpolation(values:number[], k:number):number {
        var m = values.length - 1;
        var f = m * k;
        var i = Math.floor(f);

        if (k < 0)
        {
            return MathCommon.linear(values[0], values[1], f);
        }
        else if (k > 1)
        {
            return MathCommon.linear(values[m], values[m - 1], m - f);
        }
        else
        {
            return MathCommon.linear(values[i], values[(i + 1 > m) ? m : i + 1], f - i);
        }
    };


    /**
     * A quadratic bezier interpolation method.
     *
     * @param {number} t - The percentage of interpolation, between 0 and 1.
     * @param {number} p0 - The start point.
     * @param {number} p1 - The control point.
     * @param {number} p2 - The end point.
     *
     * @return {number} The interpolated value.
     */
    static quadraticBezierInterpolation (t:number, p0:number, p1:number, p2:number):number
    {
        const k:number = 1 - t;
        const calP0:number = k * k * p0;
        const calP1:number = 2 * (1 - t) * t * p1;
        const calP2:number = t * t * p2;
        return calP0 + calP1 + calP2;
    };


    /**
     * A Smooth Step interpolation method.
     * 
     * @see {@link https://en.wikipedia.org/wiki/Smoothstep}
     *
     * @param {number} t - The percentage of interpolation, between 0 and 1.
     * @param {number} min - The minimum value, also known as the 'left edge', assumed smaller than the 'right edge'.
     * @param {number} max - The maximum value, also known as the 'right edge', assumed greater than the 'left edge'.
     *
     * @return {number} The interpolated value.
     */
    static smoothStepInterpolation(t:number, min:number, max:number):number
    {
        return min + (max - min) * MathCommon.smoothStep(t, 0, 1);
    };

    
    /**
     * A Smoother Step interpolation method.
     * 
     * @see {@link https://en.wikipedia.org/wiki/Smoothstep#Variations}
     *
     * @param {number} t - The percentage of interpolation, between 0 and 1.
     * @param {number} min - The minimum value, also known as the 'left edge', assumed smaller than the 'right edge'.
     * @param {number} max - The maximum value, also known as the 'right edge', assumed greater than the 'left edge'.
     *
     * @return {number} The interpolated value.
     */
    static smootherStepInterpolation (t:number, min:number, max:number):number
    {
        return min + (max - min) * MathCommon.smootherStep(t, 0, 1);
    };

}


