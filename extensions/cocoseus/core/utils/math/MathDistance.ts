import { _decorator, Component, IVec3Like } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MathDistance')
export class MathDistance {

    /**
     * Calculate the distance between two sets of coordinates (points).
     *
     * @param {number} x1 - The x coordinate of the first point.
     * @param {number} y1 - The y coordinate of the first point.
     * @param {number} x2 - The x coordinate of the second point.
     * @param {number} y2 - The y coordinate of the second point.
     *
     * @return {number} The distance between each point.
     */
    static distanceBetween(x1:number, y1:number, x2:number, y2:number):number
    {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    };

    /**
     * Calculate the Chebyshev distance between two sets of coordinates (points).
     *
     * Chebyshev distance (or chessboard distance) is the maximum of the horizontal and vertical distances.
     * It's the effective distance when movement can be horizontal, vertical, or diagonal.
     * @param firstPosition Vec3
     * @param secondPosition Vec3
     * @returns 
     */
    static chessboard(firstPosition:IVec3Like, secondPosition:IVec3Like){        
        return Math.max(Math.abs(firstPosition.x - secondPosition.x), Math.abs(firstPosition.y - secondPosition.y));
    }

    /**
     * Calculate the snake distance between two sets of coordinates (points).
     *
     * Snake distance (rectilinear distance, Manhattan distance) is the sum of the horizontal and vertical distances.
     * It's the effective distance when movement is allowed only horizontally or vertically (but not both).
     * 
     * @param firstPosition 
     * @param secondPosition 
     * @returns 
     */
    static manhattan(firstPosition:IVec3Like, secondPosition:IVec3Like){      
        return Math.abs(firstPosition.x - secondPosition.x) + Math.abs(firstPosition.y - secondPosition.y);
    }
}


