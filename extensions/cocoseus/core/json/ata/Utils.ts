export class Utils {

    private static iteratorSymbol = (typeof Symbol === "function" ? Symbol : {}).iterator || "@@iterator";

    /**
    * Check if value is a finite number
    * @param {float} n - number to evaluate
    * @returns {boolean} True if n is a finite number
    */
    static isNumeric(n: number): boolean {
        let isNum: boolean = false;  
        if (typeof n === 'number') {
            isNum = !isNaN(n);
            if (isNum && !isFinite(n)) {
                throw {
                    code: "D1001",
                    value: n,
                    stack: (new Error()).stack
                };
            }
        }
        return isNum;
    }

    /**
     * Returns true if the arg is an array of strings
     * @param {*} arg - the item to test
     * @returns {boolean} True if arg is an array of strings
     */
    static isArrayOfStrings(arg: any): boolean {
        let result: boolean = false;
        /* istanbul ignore else */
        if (Array.isArray(arg)) {
            result = (arg.filter((item: any) => typeof item !== 'string').length === 0);
        }
        return result;
    }

    /**
     * Returns true if the arg is an array of numbers
     * @param {*} arg - the item to test
     * @returns {boolean} True if arg is an array of numbers
     */
    static isArrayOfNumbers(arg: any): boolean {
        let result: boolean = false;
        if (Array.isArray(arg)) {
            result = (arg.filter((item: any) => !Utils.isNumeric(item)).length === 0);
        }
        return result;
    }

    /**
     * Create an empty sequence to contain query results
     * @returns {Array} - empty sequence
     */
    static createSequence(sequence?: any[]): any[] {
        const seq: any[] = sequence || [];
        (seq as any).sequence = true;
        if (arguments.length === 1) {
            seq.push(arguments[0]);
        }
        return seq;
    }

    /**
     * Tests if a value is a sequence
     * @param {*} value the value to test
     * @returns {boolean} true if it's a sequence
     */
    static isSequence(value: any): boolean {
        if (value === null || value === undefined) {
            return false;
        }
        return value.sequence === true && Array.isArray(value);
    }

    /**
     *
     * @param {Object} arg - expression to test
     * @returns {boolean} - true if it is a function (lambda or built-in)
     */
    static isFunction(arg: any): boolean {
        return ((arg && (arg._jsonata_function === true || arg._jsonata_lambda === true)) || typeof arg === 'function');
    }

    /**
     * Returns the arity (number of arguments) of the function
     * @param {Function} func - the function
     * @returns {number} - the arity
     */
    static getFunctionArity(func: Function & { arity?: number; implementation?: Function; arguments?: any }): number {
        const arity = typeof func.arity === 'number' ? func.arity :
            typeof func.implementation === 'function' ? func.implementation.length :
                typeof func.length === 'number' ? func.length : func.arguments?.length;
        return arity;
    }

    /**
     * Tests whether arg is a lambda function
     * @param {*} arg - the value to test
     * @returns {boolean} - true if it is a lambda function
     */
    static isLambda(arg: any): boolean {
        return arg && arg._jsonata_lambda === true;
    }

    /**
     * Tests whether arg is a built-in function
     * @param {Object} arg - expression to test
     * @returns {boolean} - true if it is iterable
     */
    static isIterable(arg: any): boolean {
        return (
            typeof arg === 'object' &&
            arg !== null &&
            Utils.iteratorSymbol in arg &&
            'next' in arg &&
            typeof arg.next === 'function'
        );
    }

    /**
     * Compares two values for equality
     * @param {*} lhs first value
     * @param {*} rhs second value
     * @returns {boolean} true if they are deep equal
     */
    static isDeepEqual(lhs: any, rhs: any): boolean {
        if (lhs === rhs) {
            return true;
        }
        if (typeof lhs === 'object' && typeof rhs === 'object' && lhs !== null && rhs !== null) {
            if (Array.isArray(lhs) && Array.isArray(rhs)) {
                // both arrays (or sequences)
                // must be the same length
                if (lhs.length !== rhs.length) {
                    return false;
                }
                // must contain same values in same order
                for (let ii = 0; ii < lhs.length; ii++) {
                    if (!Utils.isDeepEqual(lhs[ii], rhs[ii])) {
                        return false;
                    }
                }
                return true;
            }
            // both objects
            // must have the same set of keys (in any order)
            let lkeys = Object.getOwnPropertyNames(lhs);
            let rkeys = Object.getOwnPropertyNames(rhs);
            if (lkeys.length !== rkeys.length) {
                return false;
            }
            lkeys = lkeys.sort();
            rkeys = rkeys.sort();
            for (let ii = 0; ii < lkeys.length; ii++) {
                if (lkeys[ii] !== rkeys[ii]) {
                    return false;
                }
            }
            // must have the same values
            for (let ii = 0; ii < lkeys.length; ii++) {
                const key = lkeys[ii];
                if (!Utils.isDeepEqual(lhs[key], rhs[key])) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    /**
     * 
     * @param {Object} arg - expression to test
     * @returns {boolean} - true if it is a promise
     */
    static isPromise(arg: any): boolean {
        return (
            typeof arg === 'object' &&
            arg !== null &&
            'then' in arg &&
            typeof arg.then === 'function'
        );
    }

    /**
     * converts a string to an array of characters
     * @param {string} str - the input string
     * @returns {Array} - the array of characters
     */
    static stringToArray(str: string): string[] {
        const arr: string[] = [];
        for (const char of str) {
            arr.push(char);
        }
        return arr;
    }

}

