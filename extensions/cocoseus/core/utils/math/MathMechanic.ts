import { _decorator, Component, Node, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MathMechanics')
export class MathMechanic extends Component {
    /**
     * Calculate a per-ms speed from a distance and time (given in seconds).
     *
     * @param {number} distance - The distance.
     * @param {number} time - The time, in seconds.
     *
     * @return {number} The speed, in distance per ms.
     *
     * @example
     * // 400px over 1 second is 0.4 px/ms
     * MathMechanic.getSpeed(400, 1) // -> 0.4
     */
    static getSpeed (distance:number, time:number):number
    {
        return (distance / time) / 1000;
    };

    /**
     * [Highlight]
     * Returns a Vec2 containing the x and y position of the given index in a `width` x `height` sized grid.
     *
     * For example, in a 6 x 4 grid, index 16 would equal col: 4 row: 2.
     *
     * If the given index is out of range an empty Vector2 is returned.
     *
     * @param {number} index - The position within the grid to get the x/y value for.
     * @param {number} width - The width of the grid.
     * @param {number} height - The height of the grid.
     * @param {Vec2} [out] - An optional Vector2 to store the result in. If not given, a new Vector2 instance will be created.
     *
     * @return {Vec2} A Vector2 where the x and y properties contain the given grid index.
     */
    static getColRowFromIndex (index:number, numOfCols:number, numOfRows:number, out?:Vec2):Vec2
    {
        if (out === undefined) { out = new Vec2(); }
        let x = 0, y = 0;
        const total = numOfCols * numOfRows;
        if (index > 0 && index <= total){
            if (index > numOfCols - 1){
                y = Math.floor(index / numOfCols);
                x = index - (y * numOfCols);
            }else{
                x = index;
            }
        }

        return out.set(x, y);
    };

    /**
     * Snap a value to nearest grid slice, using rounding.
     *
     * Example:
     * Math.round :
     *  if you have an interval gap of `5` and a position of `12`... you will snap to `10` whereas `14` will snap to `15`.
     * 
     * Math.ceil :
     *  if you have an interval gap of `5` and a position of `12`... you will snap to `15`.
     *  As will `14` snap to `15`... but `16` will snap to `20`.
     * 
     * Math.floor :
     *  if you have an interval gap of `5` and a position of `12`... you will snap to `10`.
     *  As will `14` snap to `10`... but `16` will snap to `15`.
     *
     * @param {number} value - The value to snap.
     * @param {number} gap - The interval gap of the grid.
     * @param {number} [start=0] - Optional starting offset for gap.
     * @param {boolean} [divide=false] - If `true` it will divide the snapped value by the gap before returning.
     * @param {Function} [math=Math.round] - Math.round / Math.floor / Math.ceil
     * @return {number} The snapped value.
     */
    static snapTo(value:number, gap:number, start:number = 0, divide:boolean = false, math:Function = Math.round):number
    {
        if (start === undefined) { start = 0; }
        if (gap === 0){
            return value;
        }
        value -= start;
        value = gap * math(value / gap);
        return (divide) ? (start + value) / gap : start + value;
    };


}


