export const MATH_CONST = {

    /**
     * The value of PI * 2.
     *
     * @type {number}
     */
    PI2: Math.PI * 2,

    /**
     * The value of PI * 0.5.
     *
     * Yes, we understand that this should actually be PI * 2, but
     * it has been like this for so long we can't change it now.
     * If you need PI * 2, use the PI2 constant instead.
     *
     * @type {number}
     */
    TAU: Math.PI * 0.5,

    /**
     * An epsilon value (1.0e-6)
     * @type {number}
     */
    EPSILON: 1.0e-6,

    /**
     * For converting degrees to radians (PI / 180)
     *
     * @type {number}
     */
    DEG_TO_RAD: Math.PI / 180,

    /**
     * For converting radians to degrees (180 / PI)
     *
     * @type {number}
     */
    RAD_TO_DEG: 180 / Math.PI,

    /**
     * An instance of the Random Number Generator.
     * This is not set until the Game boots.
     * @type {RandomDataGenerator}
     */
    RND: null,

    /**
     * The minimum safe integer this browser supports.
     * We use a const for backward compatibility with Internet Explorer.
     *
     * @type {number}
     */
    MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER || -9007199254740991,

    /**
     * The maximum safe integer this browser supports.
     * We use a const for backward compatibility with Internet Explorer.
     *
     * @type {number}
     */
    MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER || 9007199254740991

};

export const GEOM_CONST = {

    /**
     * A Circle Geometry object type.
     *
     * @type {number}
     */
    CIRCLE: 0,

    /**
     * An Ellipse Geometry object type.
     *
     * @type {number}
     */
    ELLIPSE: 1,

    /**
     * A Line Geometry object type.
     *
     * @type {number}
     */
    LINE: 2,

    /**
     * A Point Geometry object type.
     *
     * @type {number}
     */
    POINT: 3,

    /**
     * A Polygon Geometry object type.
     *
     * @type {number}
     */
    POLYGON: 4,

    /**
     * A Rectangle Geometry object type.
     *
     * @type {number}
     */
    RECTANGLE: 5,

    /**
     * A Triangle Geometry object type.
     *
     * @type {number}
     */
    TRIANGLE: 6

};