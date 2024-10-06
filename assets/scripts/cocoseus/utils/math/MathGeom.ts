import { _decorator, Component, Node, Rect } from 'cc';
import { IRectangleLike, Rectangle } from '../geom/Rectangle';
const { ccclass, property } = _decorator;


/**
 * Upgrade fetures for geoms instance.
 * 
 */
@ccclass('MathGeom')
export class MathGeom {
    
    static rect(rect:Rect):IRectangleLike{        
        return new Rectangle(rect);
    }
    

}


