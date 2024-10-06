import { _decorator, Node, Vec3 } from 'cc';
import { Circle } from '../geom/Circle';
import { MATH_CONST } from '../math/Const';
const { ccclass, property } = _decorator;



@ccclass('LayoutArranger')
export class LayoutArranger {
    /**
     * Takes an array of Game Objects and positions them on evenly spaced points around the perimeter of a Circle.
     *
     * If you wish to pass a `Phaser.GameObjects.Circle` Shape to this function, you should pass its `geom` property.
     *
     *
     * @param {Node[]} nodes - An array of Game Objects. The contents of this array are updated by this Action.
     * @param {Circle} circle - The Circle to position the Game Objects on.
     * @param {number} [startAngle=0] - Optional angle to start position from, in radians.
     * @param {number} [endAngle=6.28] - Optional angle to stop position at, in radians.
     *
     * @return {Node[]} The array of Game Objects that was passed to this Action.
     */
    static placeOnCircle(nodes:Node[], circle:Circle, startAngle:number = 0, endAngle:number = MATH_CONST.PI2):Node[]
    {
        if (startAngle === undefined) { startAngle = 0; }
        if (endAngle === undefined) { endAngle = 6.28; }

        var angle = startAngle;
        var angleStep = (endAngle - startAngle) / nodes.length;

        var cx = circle.x;
        var cy = circle.y;
        var radius = circle.radius;

        for (var i = 0; i < nodes.length; i++){
            const node:Node = nodes[i];
            if(node){
                node.setPosition(new Vec3(cx + (radius * Math.cos(angle)) , cy + (radius * Math.sin(angle))));
                angle += angleStep;
            }
        }

        return nodes;
    };




}


