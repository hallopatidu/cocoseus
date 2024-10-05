import { _decorator, Component} from 'cc';
const { ccclass, property } = _decorator;


export type SinCosCoupleType = {
    sin: number[],
    cos: number[],
    length: number
}

@ccclass('MathCommon')
export class MathCommon extends Component {
    
    /**
     * Calculate the mean average of the given values.
     * @param {number[]} values - The values to average.
     * @return {number} The average value.
     */
    static average(values:number[]):number{
        let sum = 0;

        for (let i = 0; i < values.length; i++)
        {
            sum += (+values[i]);
        }
    
        return sum / values.length;
    }

    /**
     * Compute a random integer between the `min` and `max` values, inclusive.
     * @param {number} min - The minimum value.
     * @param {number} max - The maximum value. 
     * @returns 
     */
    static between (min:number, max:number):number{
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    /**
     * Calculates a Catmull-Rom value from the given points, based on an alpha of 0.5.
     * 
     * @param {number} t - The amount to interpolate by.
     * @param {number} p0 - The first control point.
     * @param {number} p1 - The second control point.
     * @param {number} p2 - The third control point.
     * @param {number} p3 - The fourth control point.
     *
     * @return {number} The Catmull-Rom value.
     */
    static catmullRom (t:number, p0:number, p1:number, p2:number, p3:number):number{
        const v0 = (p2 - p0) * 0.5;
        const v1 = (p3 - p1) * 0.5;
        const t2 = t * t;
        const t3 = t * t2;    
        return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
    };

    /**
     * Ceils to some place comparative to a `base`, default is 10 for decimal place.
     *
     * The `place` is represented by the power applied to `base` to get that place.
     *      
     * @param {number} value - The value to round.
     * @param {number} [place=0] - The place to round to.
     * @param {number} [base=10] - The base to round in. Default is 10 for decimal.
     *
     * @return {number} The rounded value.
     */
    static ceilTo (value:number, place:number, base:number):number{
        if (place === undefined) { place = 0; }
        if (base === undefined) { base = 10; }
        const p = Math.pow(base, -place);
        return Math.ceil(value * p) / p;
    };

    /**
     * Floors to some place comparative to a `base`, default is 10 for decimal place.
     *
     * The `place` is represented by the power applied to `base` to get that place.
     *
     * @param {number} value - The value to round.
     * @param {number} [place=0] - The place to round to.
     * @param {number} [base=10] - The base to round in. Default is 10 for decimal.
     *
     * @return {number} The rounded value.
     */
    static floorTo (value:number, place:number, base:number):number
    {
        if (place === undefined) { place = 0; }
        if (base === undefined) { base = 10; }

        const p = Math.pow(base, -place);

        return Math.floor(value * p) / p;
    };

    /**
    * Force a value within the boundaries by clamping it to the range `min`, `max`.
    *
    * @param {number} value - The value to be clamped.
    * @param {number} min - The minimum bounds.
    * @param {number} max - The maximum bounds.
    *
    * @return {number} The clamped value.
    */
    static clamp(value:number, min:number, max:number):number{
       return Math.max(min, Math.min(max, value));
    };


    /**
     * Calculates the positive difference of two given numbers.
     *
     * @param {number} a - The first number in the calculation.
     * @param {number} b - The second number in the calculation.
     *
     * @return {number} The positive difference of the two given numbers.
     */
    static difference (a:number, b:number):number{
        return Math.abs(a - b);
    };    

    /**
     * Calculates the factorial of a given number for integer values greater than 0.
     * 
     * @param {number} value - A positive integer to calculate the factorial of.
     *
     * @return {number} The factorial of the given number.
     */
    static factorial(value:number):number{
        if (value === 0)
        {
            return 1;
        }

        let res = value;

        while (--value)
        {
            res *= value;
        }

        return res;
    };

    /**
     * Calculates the Bernstein basis from the three factorial coefficients.
     *
     * @function Phaser.Math.Bernstein
     * @since 3.0.0
     *
     * @param {number} n - The first value.
     * @param {number} i - The second value.
     *
     * @return {number} The Bernstein basis of Factorial(n) / Factorial(i) / Factorial(n - i)
     */
    static bernstein(n:number, i:number):number {
        return this.factorial(n) / this.factorial(i) / this.factorial(n - i);
    }

    /**
     * Return a value based on the range between `min` and `max` and the percentage given.
     *
     * @param {number} percent - A value between 0 and 1 representing the percentage.
     * @param {number} min - The minimum value.
     * @param {number} [max] - The maximum value.
     *
     * @return {number} The value that is `percent` percent between `min` and `max`.
     */
    static fromPercent (percent:number, min:number, max:number):number{
        percent = this.clamp(percent, 0, 1);
        return (max - min) * percent + min;
    };

    /**
     * Check if a given value is an even number.
     *
     * @param {number} value - The number to perform the check with.
     *
     * @return {boolean} Whether the number is even or not.
     */
    static isEvenNumber(value:number):boolean{
        // Use abstract equality == for "is number" test
        // eslint-disable-next-line eqeqeq
        return (value == parseFloat(value.toString())) ? !(value % 2) : void 0;
    };
    
    /**
     * Check if a given value is an even number using a strict type check.
     *
     * @param {number} value - The number to perform the check with.
     *
     * @return {boolean} Whether the number is even or not.
     */
    static isEvenNumberStrict(value:number):boolean{
        // Use strict equality === for "is number" test
        return (value === parseFloat(value.toString())) ? !(value % 2) : void 0;
    };


    /**
     * Calculates a linear (interpolation) value over t.
     *
     * @param {number} p0 - The first point.
     * @param {number} p1 - The second point.
     * @param {number} t - The percentage between p0 and p1 to return, represented as a number between 0 and 1.
     *
     * @return {number} The step t% of the way between p0 and p1.
     */
    static linear (p0:number, p1:number, t:number):number{
        return (p1 - p0) * t + p0;
    };

    

    /**
     * Add an `amount` to a `value`, limiting the maximum result to `max`.
     *
     * @param {number} value - The value to add to.
     * @param {number} amount - The amount to add.
     * @param {number} max - The maximum value to return.
     *
     * @return {number} The resulting value.
     */
    static maxAdd (value:number, amount:number, max:number):number{
        return Math.min(value + amount, max);
    };

    /**
     * Calculate the median of the given values. The values are sorted and the middle value is returned.
     * In case of an even number of values, the average of the two middle values is returned.
     *
     * @function Phaser.Math.Median
     * @since 3.54.0
     *
     * @param {number[]} values - The values to average.
     *
     * @return {number} The median value.
     */
    static median(values:number[]):number
    {
        const valuesNum = values.length;
        if (valuesNum === 0) return 0;        
        values.sort(function (a, b) { return a - b; });
        const halfIndex = Math.floor(valuesNum / 2);
        return valuesNum % 2 === 0
            ? (values[halfIndex] + values[halfIndex - 1]) / 2
            : values[halfIndex];
    };

    /**
     * Subtract an `amount` from `value`, limiting the minimum result to `min`.
     *
     * @function Phaser.Math.MinSub
     * @since 3.0.0
     *
     * @param {number} value - The value to subtract from.
     * @param {number} amount - The amount to subtract.
     * @param {number} min - The minimum value to return.
     *
     * @return {number} The resulting value.
     */
    static minSub(value:number, amount:number, min:number):number{
        return Math.max(value - amount, min);
    };

    
    /**
     * Work out what percentage `value` is of the range between `min` and `max`.
     * If `max` isn't given then it will return the percentage of `value` to `min`.
     *
     * You can optionally specify an `upperMax` value, which is a mid-way point in the range that represents 100%, after which the % starts to go down to zero again.
     *
     * @function Phaser.Math.Percent
     * @since 3.0.0
     *
     * @param {number} value - The value to determine the percentage of.
     * @param {number} min - The minimum value.
     * @param {number} [max] - The maximum value.
     * @param {number} [upperMax] - The mid-way point in the range that represents 100%.
     *
     * @return {number} A value between 0 and 1 representing the percentage.
     */
    static percent (value:number, min:number, max:number, upperMax:number):number{
        if (max === undefined) { max = min + 1; }

        let percentage = (value - min) / (max - min);

        if (percentage > 1)
        {
            if (upperMax !== undefined)
            {
                percentage = ((upperMax - value)) / (upperMax - max);

                if (percentage < 0)
                {
                    percentage = 0;
                }
            }
            else
            {
                percentage = 1;
            }
        }
        else if (percentage < 0)
        {
            percentage = 0;
        }

        return percentage;
    };


    /**
     * Round a given number so it is further away from zero. That is, positive numbers are rounded up, and negative numbers are rounded down.
     *
     * @param {number} value - The number to round.
     *
     * @return {number} The rounded number, rounded away from zero.
     */
    static roundAwayFromZero (value:number):number {
        // "Opposite" of truncate.
        return (value > 0) ? Math.ceil(value) : Math.floor(value);
    };


    /**
     * Round a value to the given precision.
     *
     * For example:
     *
     * ```
     * RoundTo(123.456, 0) = 123
     * RoundTo(123.456, 1) = 120
     * roundTo(123.456, 2) = 100
     * ```
     *
     * To round the decimal, i.e. to round to precision, pass in a negative `place`:
     *
     * ```
     * roundTo(123.456789, 0) = 123
     * roundTo(123.456789, -1) = 123.5
     * roundTo(123.456789, -2) = 123.46
     * roundTo(123.456789, -3) = 123.457
     * ```
     *
     * @param {number} value - The value to round.
     * @param {number} [place=0] - The place to round to. Positive to round the units, negative to round the decimal.
     * @param {number} [base=10] - The base to round in. Default is 10 for decimal.
     *
     * @return {number} The rounded value.
     */
    static roundTo(value:number, place:number, base:number):number
    {
        if (place === undefined) { place = 0; }
        if (base === undefined) { base = 10; }

        const p = Math.pow(base, -place);

        return Math.round(value * p) / p;
    };


    /**
     * Generate a series of sine and cosine values.
     *
     * @param {number} length - The number of values to generate.
     * @param {number} [sinAmp=1] - The sine value amplitude.
     * @param {number} [cosAmp=1] - The cosine value amplitude.
     * @param {number} [frequency=1] - The frequency of the values.
     *
     * @return {SinCosCoupleType} The generated values.
     */
    static sinCosCoupleGenerator (length:number, sinAmp:number, cosAmp:number, frequency):SinCosCoupleType
    {
        if (sinAmp === undefined) { sinAmp = 1; }
        if (cosAmp === undefined) { cosAmp = 1; }
        if (frequency === undefined) { frequency = 1; }

        frequency *= Math.PI / length;

        const cos = [];
        const sin = [];

        for (let c = 0; c < length; c++)
        {
            cosAmp -= sinAmp * frequency;
            sinAmp += cosAmp * frequency;

            cos[c] = cosAmp;
            sin[c] = sinAmp;
        }

        return {
            sin: sin,
            cos: cos,
            length: length
        };
    };

    /**
     * [Highlight]
     * Calculate a smooth interpolation percentage of `x` between `min` and `max`.
     *
     * The function receives the number `x` as an argument and returns 0 if `x` is less than or equal to the left edge,
     * 1 if `x` is greater than or equal to the right edge, and smoothly interpolates, using a Hermite polynomial,
     * between 0 and 1 otherwise.
     *
     * @param {number} x - The input value.
     * @param {number} min - The minimum value, also known as the 'left edge', assumed smaller than the 'right edge'.
     * @param {number} max - The maximum value, also known as the 'right edge', assumed greater than the 'left edge'.
     *
     * @return {number} The percentage of interpolation, between 0 and 1.
     */
    static smoothStep (x:number, min:number, max:number):number {
        if (x <= min) return 0;
        if (x >= max) return 1;
        x = (x - min) / (max - min);
        return x * x * (3 - 2 * x);
    };

    /**
     * [Highlight]
     * Calculate a smoother interpolation percentage of `x` between `min` and `max`.
     *
     * The function receives the number `x` as an argument and returns 0 if `x` is less than or equal to the left edge,
     * 1 if `x` is greater than or equal to the right edge, and smoothly interpolates, using a Hermite polynomial,
     * between 0 and 1 otherwise.
     *
     * Produces an even smoother interpolation than {@link MathCommon.smoothStep}.
     *
     * @param {number} x - The input value.
     * @param {number} min - The minimum value, also known as the 'left edge', assumed smaller than the 'right edge'.
     * @param {number} max - The maximum value, also known as the 'right edge', assumed greater than the 'left edge'.
     *
     * @return {number} The percentage of interpolation, between 0 and 1.
     */
    static smootherStep(x:number, min:number, max:number):number {
        x = Math.max(0, Math.min(1, (x - min) / (max - min)));
        return x * x * x * (x * (x * 6 - 15) + 10);
    };


    /**
     * [Highlight]
     * Checks if the two values are within the given `tolerance` of each other. (tolerance: Dung sai)
     *
     * @param {number} a - The first value to use in the calculation.
     * @param {number} b - The second value to use in the calculation.
     * @param {number} tolerance - The tolerance. Anything equal to or less than this value is considered as being within range.
     *
     * @return {boolean} Returns `true` if `a` is less than or equal to the tolerance of `b`.
     */
    static within (a:number, b:number, tolerance:number):boolean {
        return (Math.abs(a - b) <= tolerance);
    };

    /**
     * [Highlight]
     * Wrap the given `value` between `min` and `max`.
     *
     * @param {number} value - The value to wrap.
     * @param {number} min - The minimum value.
     * @param {number} max - The maximum value.
     *
     * @return {number} The wrapped value.
     */
    static wrap(value:number, min:number, max:number):number{
        const range = max - min;
        return (min + ((((value - min) % range) + range) % range));
    };
}


