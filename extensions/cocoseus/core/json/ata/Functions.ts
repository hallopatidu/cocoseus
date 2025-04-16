import { Utils } from "./Utils";

export class Functions {
    /**
     * Sum function
     * @param {Object} args - Arguments
     * @returns {number} Total value of arguments
     */
    /**
     * Sum function
     * @param {number[]} args - Array of numbers
     * @returns {number | undefined} Total value of arguments or undefined if input is undefined
     */
    static sum(args: number[]): number | undefined {
        // undefined inputs always return undefined
        if (typeof args === 'undefined') {
            return undefined;
        }

        let total = 0;
        args.forEach((num) => {
            total += num;
        });
        return total;
    }

    /**
     * Count function
     * @param {Object} args - Arguments
     * @returns {number} Number of elements in the array
     */
    /**
     * Count function
     * @param {number[]} args - Array of numbers
     * @returns {number} Number of elements in the array
     */
    static count(args: number[]): number {
        // undefined inputs always return 0
        if (typeof args === 'undefined') {
            return 0;
        }

        return args.length;
    }

    /**
     * Max function
     * @param {number[]} args - Array of numbers
     * @returns {number | undefined} Max element in the array or undefined if input is undefined or empty
     */
    static max(args: number[]): number | undefined {
        // undefined inputs always return undefined
        if (typeof args === 'undefined' || args.length === 0) {
            return undefined;
        }

        return Math.max.apply(Math, args);
    }

    /**
     * Min function
     * @param {number[]} args - Array of numbers
     * @returns {number | undefined} Min element in the array or undefined if input is undefined or empty
     */
    static min(args: number[]): number | undefined {
        // undefined inputs always return undefined
        if (typeof args === 'undefined' || args.length === 0) {
            return undefined;
        }

        return Math.min.apply(Math, args);
    }

    /**
     * Average function
     * @param {Object} args - Arguments
     * @returns {number} Average element in the array
     */
    /**
     * Average function
     * @param {number[]} args - Array of numbers
     * @returns {number | undefined} Average value of arguments or undefined if input is undefined or empty
     */
    static average(args: number[]): number | undefined {
        // undefined inputs always return undefined
        if (typeof args === 'undefined' || args.length === 0) {
            return undefined;
        }

        let total = 0;
        args.forEach(function (num) {
            total += num;
        });
        return total / args.length;
    }

    /**
     * Stringify arguments
     * @param {Object} arg - Arguments
     * @param {boolean} [prettify] - Pretty print the result
     * @returns {String} String from arguments
     */
    static string(arg: any, prettify: boolean = false): string | undefined {
        // undefined inputs always return undefined
        if (typeof arg === 'undefined') {
            return undefined;
        }

        let str: string;

        if (typeof arg === 'string') {
            // already a string
            str = arg;
        } else if (typeof arg === 'function') {
            // functions (built-in and lambda convert to empty string)
            str = '';
        } else if (typeof arg === 'number' && !isFinite(arg)) {
            throw {
                code: "D3001",
                value: arg,
                stack: (new Error()).stack
            };
        } else {
            const space = prettify ? 2 : 0;
            if (Array.isArray(arg) && (arg as any).outerWrapper) {
                arg = arg[0];
            }
            str = JSON.stringify(arg, (key, val) => {
                return (typeof val !== 'undefined' && val !== null && val.toPrecision && !isNaN(val)) 
                    ? Number(val.toPrecision(15)) 
                    : (val && typeof val === 'function') 
                        ? '' 
                        : val;
            }, space);
        }
        return str;
    }

    /**
     * Create substring based on character number and length
     * @param {String} str - String to evaluate
     * @param {Integer} start - Character number to start substring
     * @param {Integer} [length] - Number of characters in substring
     * @returns {string|*} Substring
     */
    static substring(str, start, length) {
        // undefined inputs always return undefined
        if (typeof str === 'undefined') {
            return undefined;
        }

        var strArray = Utils.stringToArray(str);
        var strLength = strArray.length;

        if (strLength + start < 0) {
            start = 0;
        }

        if (typeof length !== 'undefined') {
            if (length <= 0) {
                return '';
            }
            var end = start >= 0 ? start + length : strLength + start + length;
            return strArray.slice(start, end).join('');
        }

        return strArray.slice(start).join('');
    }


    /**
     * Create substring up until a character
     * @param {String} str - String to evaluate
     * @param {String} chars - Character to define substring boundary
     * @returns {string | undefined} Substring or undefined if input is undefined
     */
    static substringBefore(str: string, chars: string): string | undefined {
        // undefined inputs always return undefined
        if (typeof str === 'undefined') {
            return undefined;
        }

        const pos = str.indexOf(chars);
        if (pos > -1) {
            return str.substr(0, pos);
        } else {
            return str;
        }
    }

    /**
     * Create substring after a character
     * @param {string} str - String to evaluate
     * @param {string} chars - Character to define substring boundary
     * @returns {string | undefined} Substring or undefined if input is undefined
     */
    static substringAfter(str: string, chars: string): string | undefined {
        // undefined inputs always return undefined
        if (typeof str === 'undefined') {
            return undefined;
        }

        const pos = str.indexOf(chars);
        if (pos > -1) {
            return str.substr(pos + chars.length);
        } else {
            return str;
        }
    }

    
    /**
     * Lowercase a string
     * @param {string} str - String to evaluate
     * @returns {string | undefined} Lowercase string or undefined if input is undefined
     */
    static lowercase(str: string): string | undefined {
        // undefined inputs always return undefined
        if (typeof str === 'undefined') {
            return undefined;
        }

        return str.toLowerCase();
    }


    /**
     * Uppercase a string
     * @param {string} str - String to evaluate
     * @returns {string | undefined} Uppercase string or undefined if input is undefined
     */
    static uppercase(str: string): string | undefined {
        // undefined inputs always return undefined
        if (typeof str === 'undefined') {
            return undefined;
        }

        return str.toUpperCase();
    }


    /**
     * Length of a string
     * @param {string} str - String to evaluate
     * @returns {number | undefined} The number of characters in the string or undefined if input is undefined
     */
    static getLength(str: string): number | undefined {
        // undefined inputs always return undefined
        if (typeof str === 'undefined') {
            return undefined;
        }

        return Utils.stringToArray(str).length;
    }


    /**
     * Normalize and trim whitespace within a string
     * @param {string} str - string to be trimmed
     * @returns {string | undefined} - trimmed string or undefined if input is undefined
     */
    static trim(str: string): string | undefined {
        // undefined inputs always return undefined
        if (typeof str === 'undefined') {
            return undefined;
        }

        // normalize whitespace
        var result = str.replace(/[ \t\n\r]+/gm, ' ');
        if (result.charAt(0) === ' ') {
            // strip leading space
            result = result.substring(1);
        }
        if (result.charAt(result.length - 1) === ' ') {
            // strip trailing space
            result = result.substring(0, result.length - 1);
        }
        return result;
    }

    /**
     * Pad a string to a minimum width by adding characters to the start or end
     * @param {string} str - string to be padded
     * @param {number} width - the minimum width; +ve pads to the right, -ve pads to the left
     * @param {string} [char] - the pad character(s); defaults to ' '
     * @returns {string} - padded string
     */
    static pad(str: string, width: number, char: string = ' '): string | undefined {
        // undefined inputs always return undefined
        if (typeof str === 'undefined') {
            return undefined;
        }

        if (typeof char === 'undefined' || char.length === 0) {
            char = ' ';
        }

        let result: string;
        width = Math.trunc(width);
        const padLength = Math.abs(width) - this.getLength(str)!;
        if (padLength > 0) {
            let padding = (new Array(padLength + 1)).join(char);
            if (char.length > 1) {
                padding = this.substring(padding, 0, padLength)!;
            }
            if (width > 0) {
                result = str + padding;
            } else {
                result = padding + str;
            }
        } else {
            result = str;
        }
        return result;
    }


    /**
     * Evaluates a matcher function against a given string and ensures the result conforms to the expected structure.
     *
     * @param {(str: string) => any} matcher - A function that takes a string as input and returns a result.
     * @param {string} str - The input string to be evaluated by the matcher function.
     * @returns {Promise<any>} A promise that resolves to the result of the matcher function if it conforms to the expected structure.
     * @throws An error with code "T1010" if the matcher function does not return the correct structure.
     */
    static async evaluateMatcher(matcher: (str: string) => any, str?: string): Promise<any> {
        var result = matcher.apply(this, [str]); // eslint-disable-line no-useless-call
        if (Utils.isPromise(result)) {
            result = await result;
        }
        if (result && !(typeof result.start === 'number' || result.end === 'number' || Array.isArray(result.groups) || Utils.isFunction(result.next))) {
            // the matcher function didn't return the correct structure
            throw {
                code: "T1010",
                stack: (new Error()).stack,
            };
        }
        return result;
    }

    
    /**
     * Tests if the str contains the token
     * @param {string} str - String to test
     * @param {string | RegExp} token - Substring or regex to find
     * @returns {Promise<boolean | undefined>} - True if str contains token, otherwise undefined
     */
    static async contains(str: string, token: string | ((str: string) => any)): Promise<boolean | undefined> {
        // undefined inputs always return undefined
        if (typeof str === 'undefined') {
            return undefined;
        }

        let result: boolean;

        if (typeof token === 'string') {
            result = str.indexOf(token) !== -1;
        } else {
            const matches = await this.evaluateMatcher(token, str);
            result = typeof matches !== 'undefined';
        }

        return result;
    }

    /**
     * Match a string with a regex returning an array of object containing details of each match
     * @param {String} str - string
     * @param {String} regex - the regex applied to the string
     * @param {Integer} [limit] - max number of matches to return
     * @returns {Array} The array of match objects
     */
    static async match(
        str: string,
        regex: RegExp | ((str: string) => any),
        limit?: number
    ): Promise<Array<{ match: string; index: number; groups: any[] }> | undefined> {
        // undefined inputs always return undefined
        if (typeof str === 'undefined') {
            return undefined;
        }

        // limit, if specified, must be a non-negative number
        if (limit !== undefined && limit < 0) {
            throw {
                stack: (new Error()).stack,
                value: limit,
                code: 'D3040',
                index: 3
            };
        }

        const result: Array<{ match: string; index: number; groups: any[] }> = Utils.createSequence();

        if (limit === undefined || limit > 0) {
            let count = 0;
            let matches = typeof regex === 'function' 
                ? await this.evaluateMatcher(regex, str) 
                : str.match(regex);
            if (matches !== undefined) {
                while (matches !== undefined && (limit === undefined || count < limit)) {
                    result.push({
                        match: matches.match,
                        index: matches.start,
                        groups: matches.groups
                    });
                    matches = await this.evaluateMatcher(matches.next);
                    count++;
                }
            }
        }

        return result;
    }

    /**
     * Match a string with a regex returning an array of object containing details of each match
     * @param {String} str - string
     * @param {String} pattern - the substring/regex applied to the string
     * @param {String} replacement - text to replace the matched substrings
     * @param {Integer} [limit] - max number of matches to return
     * @returns {Array} The array of match objects
     */
    static async replace(
        str: string,
        pattern: string | ((str: string) => any),
        replacement: string | ((regexMatch: { match: string; groups: string[] }) => string | Promise<string>),
        limit?: number
    ): Promise<string | undefined> {
        // undefined inputs always return undefined
        if (typeof str === 'undefined') {
            return undefined;
        }

        var self = this;

        // pattern cannot be an empty string
        if (pattern === '') {
            throw {
                code: "D3010",
                stack: (new Error()).stack,
                value: pattern,
                index: 2
            };
        }

        // limit, if specified, must be a non-negative number
        if (limit !== undefined && limit < 0) {
            throw {
                code: "D3011",
                stack: (new Error()).stack,
                value: limit,
                index: 4
            };
        }

        var replacer: (regexMatch: { match: string; groups: string[] }) => string | Promise<string>;
        if (typeof replacement === 'string') {
            replacer = function (regexMatch) {
                var substitute = '';
                // scan forward, copying the replacement text into the substitute string
                // and replace any occurrence of $n with the values matched by the regex
                var position = 0;
                var index = replacement.indexOf('$', position);
                while (index !== -1 && position < replacement.length) {
                    substitute += replacement.substring(position, index);
                    position = index + 1;
                    var dollarVal = replacement.charAt(position);
                    if (dollarVal === '$') {
                        // literal $
                        substitute += '$';
                        position++;
                    } else if (dollarVal === '0') {
                        substitute += regexMatch.match;
                        position++;
                    } else {
                        var maxDigits;
                        if (regexMatch.groups.length === 0) {
                            // no sub-matches; any $ followed by a digit will be replaced by an empty string
                            maxDigits = 1;
                        } else {
                            // max number of digits to parse following the $
                            maxDigits = Math.floor(Math.log(regexMatch.groups.length) * Math.LOG10E) + 1;
                        }
                        index = parseInt(replacement.substring(position, position + maxDigits), 10);
                        if (maxDigits > 1 && index > regexMatch.groups.length) {
                            index = parseInt(replacement.substring(position, position + maxDigits - 1), 10);
                        }
                        if (!isNaN(index)) {
                            if (regexMatch.groups.length > 0) {
                                var submatch = regexMatch.groups[index - 1];
                                if (typeof submatch !== 'undefined') {
                                    substitute += submatch;
                                }
                            }
                            position += index.toString().length;
                        } else {
                            // not a capture group, treat the $ as literal
                            substitute += '$';
                        }
                    }
                    index = replacement.indexOf('$', position);
                }
                substitute += replacement.substring(position);
                return substitute;
            };
        } else {
            replacer = replacement;
        }

        var result = '';
        var position = 0;

        if (typeof limit === 'undefined' || limit > 0) {
            var count = 0;
            if (typeof pattern === 'string') {
                var index = str.indexOf(pattern, position);
                while (index !== -1 && (typeof limit === 'undefined' || count < limit)) {
                    result += str.substring(position, index);
                    result += replacement;
                    position = index + pattern.length;
                    count++;
                    index = str.indexOf(pattern, position);
                }
                result += str.substring(position);
            } else {
                var matches = await this.evaluateMatcher(pattern, str);
                if (typeof matches !== 'undefined') {
                    while (typeof matches !== 'undefined' && (typeof limit === 'undefined' || count < limit)) {
                        result += str.substring(position, matches.start);
                        var replacedWith = replacer.apply(self, [matches]);
                        if (Utils.isPromise(replacedWith)) {
                            replacedWith = await replacedWith;
                        }
                        // check replacedWith is a string
                        if (typeof replacedWith === 'string') {
                            result += replacedWith;
                        } else {
                            // not a string - throw error
                            throw {
                                code: "D3012",
                                stack: (new Error()).stack,
                                value: replacedWith
                            };
                        }
                        position = matches.start + matches.match.length;
                        count++;
                        matches = await this.evaluateMatcher(matches.next);
                    }
                    result += str.substring(position);
                } else {
                    result = str;
                }
            }
        } else {
            result = str;
        }

        return result;
    }

    /**
     * Base64 encode a string
     * @param {String} str - string
     * @returns {String} Base 64 encoding of the binary data
     */
    static base64encode(str) {
        // undefined inputs always return undefined
        if (typeof str === 'undefined') {
            return undefined;
        }
        // Use btoa in a browser, or Buffer in Node.js

        var btoa = typeof window !== 'undefined' ?
            /* istanbul ignore next */ window.btoa :
            function (str) {
                // Simply doing `new Buffer` at this point causes Browserify to pull
                // in the entire Buffer browser library, which is large and unnecessary.
                // Using `global.Buffer` defeats this.
                return new globalThis.Buffer.from(str, 'binary').toString('base64'); // eslint-disable-line new-cap
            };
        return btoa(str);
    }

    /**
     * Base64 decode a string
     * @param {String} str - string
     * @returns {String} Base 64 encoding of the binary data
     */
    static base64decode(str: string): string | undefined {
        // undefined inputs always return undefined
        if (typeof str === 'undefined') {
            return undefined;
        }
        // Use atob in a browser, or Buffer in Node.js
        var atob = typeof window !== 'undefined' ?
            /* istanbul ignore next */ window.atob :
            function (str: string): string {
                // Simply doing `new Buffer` at this point causes Browserify to pull
                // in the entire Buffer browser library, which is large and unnecessary.
                // Using `global.Buffer` defeats this.
                return new globalThis.Buffer.from(str, 'base64').toString('binary'); // eslint-disable-line new-cap
            };
        return atob(str);
    }

    /**
     * Encode a string into a component for a url
     * @param {String} str - String to encode
     * @returns {string} Encoded string
     */
    static encodeUrlComponent(str: string): string | undefined {
        // undefined inputs always return undefined
        if (typeof str === 'undefined') {
            return undefined;
        }

        // Catch URIErrors when URI sequence is malformed
        let returnVal: string;
        try {
            returnVal = encodeURIComponent(str);
        } catch (e) {
            throw {
                code: "D3140",
                stack: (new Error()).stack,
                value: str,
                functionName: "encodeUrlComponent"
            };
        }
        return returnVal;
    }

    /**
     * Encode a string into a url
     * @param {String} str - String to encode
     * @returns {string} Encoded string
     */
    static encodeUrl(str) {
        // undefined inputs always return undefined
        if (typeof str === 'undefined') {
            return undefined;
        }

        // Catch URIErrors when URI sequence is malformed
        var returnVal;
        try {
            returnVal = encodeURI(str);
        } catch (e) {
            throw {
                code: "D3140",
                stack: (new Error()).stack,
                value: str,
                functionName: "encodeUrl"
            };
        }
        return returnVal;
    }

    /**
     * Decode a string from a component for a url
     * @param {String} str - String to decode
     * @returns {string} Decoded string
     */
    static decodeUrlComponent(str: string): string | undefined {
        // undefined inputs always return undefined
        if (typeof str === 'undefined') {
            return undefined;
        }

        // Catch URIErrors when URI sequence is malformed
        let returnVal: string;
        try {
            returnVal = decodeURIComponent(str);
        } catch (e) {
            throw {
                code: "D3140",
                stack: (new Error()).stack,
                value: str,
                functionName: "decodeUrlComponent"
            };
        }
        return returnVal;
    }

    /**
     * Decode a string from a url
     * @param {String} str - String to decode
     * @returns {string} Decoded string
     */
    static decodeUrl(str: string): string | undefined {
        // undefined inputs always return undefined
        if (typeof str === 'undefined') {
            return undefined;
        }

        // Catch URIErrors when URI sequence is malformed
        let returnVal: string;
        try {
            returnVal = decodeURI(str);
        } catch (e) {
            throw {
                code: "D3140",
                stack: (new Error()).stack,
                value: str,
                functionName: "decodeUrl"
            };
        }
        return returnVal;
    }

    /**
     * Split a string into an array of substrings
     * @param {String} str - string
     * @param {String} separator - the token or regex that splits the string
     * @param {Integer} [limit] - max number of substrings
     * @returns {Array} The array of string
     */
    static async split(
        str: string,
        separator: string | ((str: string) => any),
        limit?: number
    ): Promise<string[] | undefined> {
        // undefined inputs always return undefined
        if (typeof str === 'undefined') {
            return undefined;
        }

        // limit, if specified, must be a non-negative number
        if (limit !== undefined && limit < 0) {
            throw {
                code: "D3020",
                stack: (new Error()).stack,
                value: limit,
                index: 3
            };
        }

        var result: string[] = [];

        if (typeof limit === 'undefined' || limit > 0) {
            if (typeof separator === 'string') {
                result = str.split(separator, limit);
            } else {
                var count = 0;
                var matches = await this.evaluateMatcher(separator, str);
                if (typeof matches !== 'undefined') {
                    var start = 0;
                    while (typeof matches !== 'undefined' && (typeof limit === 'undefined' || count < limit)) {
                        result.push(str.substring(start, matches.start));
                        start = matches.end;
                        matches = await this.evaluateMatcher(matches.next);
                        count++;
                    }
                    if (typeof limit === 'undefined' || count < limit) {
                        result.push(str.substring(start));
                    }
                } else {
                    result.push(str);
                }
            }
        }

        return result;
    }

    /**
     * Join an array of strings
     * @param {Array} strs - array of string
     * @param {String} [separator] - the token that splits the string
     * @returns {String} The concatenated string
     */
    static join(strs: string[], separator?: string): string | undefined {
        // undefined inputs always return undefined
        if (typeof strs === 'undefined') {
            return undefined;
        }

        // if separator is not specified, default to empty string
        if (typeof separator === 'undefined') {
            separator = "";
        }

        return strs.join(separator);
    }

    /**
     * Formats a number into a decimal string representation using XPath 3.1 F&O fn:format-number spec
     * @param {number} value - number to format
     * @param {String} picture - picture string definition
     * @param {Object} [options] - override locale defaults
     * @returns {String} The formatted string
     */
    static formatNumber(value: number, picture: string, options?: Record<string, string>): string | undefined {
        // undefined inputs always return undefined
        if (typeof value === 'undefined') {
            return undefined;
        }

        const defaults: Record<string, string> = {
            "decimal-separator": ".",
            "grouping-separator": ",",
            "exponent-separator": "e",
            "infinity": "Infinity",
            "minus-sign": "-",
            "NaN": "NaN",
            "percent": "%",
            "per-mille": "\u2030",
            "zero-digit": "0",
            "digit": "#",
            "pattern-separator": ";"
        };

        // if `options` is specified, then its entries override defaults
        const properties = defaults;
        if (typeof options !== 'undefined') {
            Object.keys(options).forEach(function (key) {
                properties[key] = options[key];
            });
        }

        const decimalDigitFamily: string[] = [];
        let zeroCharCode = properties['zero-digit'].charCodeAt(0);
        for (var ii = zeroCharCode; ii < zeroCharCode + 10; ii++) {
            decimalDigitFamily.push(String.fromCharCode(ii));
        }

        const activeChars = decimalDigitFamily.concat([properties['decimal-separator'], properties['exponent-separator'], properties['grouping-separator'], properties.digit, properties['pattern-separator']]);

        const subPictures = picture.split(properties['pattern-separator']);

        if (subPictures.length > 2) {
            throw {
                code: 'D3080',
                stack: (new Error()).stack
            };
        }

        function splitParts (subpicture: string) {
            const prefix = (function () {
                var ch;
                for (var ii = 0; ii < subpicture.length; ii++) {
                    ch = subpicture.charAt(ii);
                    if (activeChars.indexOf(ch) !== -1 && ch !== properties['exponent-separator']) {
                        return subpicture.substring(0, ii);
                    }
                }
            })();
            var suffix = (function () {
                var ch;
                for (var ii = subpicture.length - 1; ii >= 0; ii--) {
                    ch = subpicture.charAt(ii);
                    if (activeChars.indexOf(ch) !== -1 && ch !== properties['exponent-separator']) {
                        return subpicture.substring(ii + 1);
                    }
                }
            })();
            var activePart = subpicture.substring(prefix?.length || 0, subpicture.length - (suffix?.length || 0));
            var mantissaPart, exponentPart, integerPart, fractionalPart;
            var exponentPosition = subpicture.indexOf(properties['exponent-separator'], prefix?.length || 0);
            if (exponentPosition === -1 || exponentPosition > subpicture.length - (suffix?.length || 0)) {
                mantissaPart = activePart;
                exponentPart = undefined;
            } else {
                mantissaPart = activePart.substring(0, exponentPosition);
                exponentPart = activePart.substring(exponentPosition + 1);
            }
            var decimalPosition = mantissaPart.indexOf(properties['decimal-separator']);
            if (decimalPosition === -1) {
                integerPart = mantissaPart;
                fractionalPart = suffix;
            } else {
                integerPart = mantissaPart.substring(0, decimalPosition);
                fractionalPart = mantissaPart.substring(decimalPosition + 1);
            }
            return {
                prefix: prefix || '',
                suffix: suffix || '',
                activePart: activePart,
                mantissaPart: mantissaPart,
                exponentPart: exponentPart,
                integerPart: integerPart,
                fractionalPart: fractionalPart,
                subpicture: subpicture
            };
        };

        // validate the picture string, F&O 4.7.3
        function validate (parts: ReturnType<typeof splitParts>) {
            var error;
            var ii;
            var subpicture = parts.subpicture;
            var decimalPos = subpicture.indexOf(properties['decimal-separator']);
            if (decimalPos !== subpicture.lastIndexOf(properties['decimal-separator'])) {
                error = 'D3081';
            }
            if (subpicture.indexOf(properties.percent) !== subpicture.lastIndexOf(properties.percent)) {
                error = 'D3082';
            }
            if (subpicture.indexOf(properties['per-mille']) !== subpicture.lastIndexOf(properties['per-mille'])) {
                error = 'D3083';
            }
            if (subpicture.indexOf(properties.percent) !== -1 && subpicture.indexOf(properties['per-mille']) !== -1) {
                error = 'D3084';
            }
            var valid = false;
            for (ii = 0; ii < parts.mantissaPart.length; ii++) {
                var ch = parts.mantissaPart.charAt(ii);
                if (decimalDigitFamily.indexOf(ch) !== -1 || ch === properties.digit) {
                    valid = true;
                    break;
                }
            }
            if (!valid) {
                error = 'D3085';
            }
            var charTypes = parts.activePart.split('').map(function (char) {
                return activeChars.indexOf(char) === -1 ? 'p' : 'a';
            }).join('');
            if (charTypes.indexOf('p') !== -1) {
                error = 'D3086';
            }
            if (decimalPos !== -1) {
                if (subpicture.charAt(decimalPos - 1) === properties['grouping-separator'] || subpicture.charAt(decimalPos + 1) === properties['grouping-separator']) {
                    error = 'D3087';
                }
            } else if (parts.integerPart.charAt(parts.integerPart.length - 1) === properties['grouping-separator']) {
                error = 'D3088';
            }
            if (subpicture.indexOf(properties['grouping-separator'] + properties['grouping-separator']) !== -1) {
                error = 'D3089';
            }
            var optionalDigitPos = parts.integerPart.indexOf(properties.digit);
            if (optionalDigitPos !== -1 && parts.integerPart.substring(0, optionalDigitPos).split('').filter(function (char) {
                return decimalDigitFamily.indexOf(char) > -1;
            }).length > 0) {
                error = 'D3090';
            }
            optionalDigitPos = parts.fractionalPart.lastIndexOf(properties.digit);
            if (optionalDigitPos !== -1 && parts.fractionalPart.substring(optionalDigitPos).split('').filter(function (char) {
                return decimalDigitFamily.indexOf(char) > -1;
            }).length > 0) {
                error = 'D3091';
            }
            var exponentExists = (typeof parts.exponentPart === 'string');
            if (exponentExists && parts.exponentPart.length > 0 && (subpicture.indexOf(properties.percent) !== -1 || subpicture.indexOf(properties['per-mille']) !== -1)) {
                error = 'D3092';
            }
            if (exponentExists && (parts.exponentPart.length === 0 || parts.exponentPart.split('').filter(function (char) {
                return decimalDigitFamily.indexOf(char) === -1;
            }).length > 0)) {
                error = 'D3093';
            }
            if (error) {
                throw {
                    code: error,
                    stack: (new Error()).stack
                };
            }
        };

        // analyse the picture string, F&O 4.7.4
        function analyse (parts: ReturnType<typeof splitParts>) {
            const getGroupingPositions = function (part: string, toLeft: boolean = false): number[] {
                const positions: number[] = [];
                let groupingPosition = part.indexOf(properties['grouping-separator']);
                while (groupingPosition !== -1) {
                    var charsToTheRight = (toLeft ? part.substring(0, groupingPosition) : part.substring(groupingPosition)).split('').filter(function (char) {
                        return decimalDigitFamily.indexOf(char) !== -1 || char === properties.digit;
                    }).length;
                    positions.push(charsToTheRight);
                    groupingPosition = parts.integerPart.indexOf(properties['grouping-separator'], groupingPosition + 1);
                }
                return positions;
            };
            // 
            const integerPartGroupingPositions = getGroupingPositions(parts.integerPart);
            // 
            function regular (indexes: number[]) {
                // are the grouping positions regular? i.e. same interval between each of them
                if (indexes.length === 0) {
                    return 0;
                }
                var gcd = function (a: number, b: number): number {
                    return b === 0 ? a : gcd(b, a % b);
                };
                // find the greatest common divisor of all the positions
                var factor = indexes.reduce(gcd);
                // is every position separated by this divisor? If so, it's regular
                for (var index = 1; index <= indexes.length; index++) {
                    if (indexes.indexOf(index * factor) === -1) {
                        return 0;
                    }
                }
                return factor;
            };

            const regularGrouping = regular(integerPartGroupingPositions);
            const fractionalPartGroupingPositions = getGroupingPositions(parts.fractionalPart, true);
            let minimumIntegerPartSize = parts.integerPart.split('').filter(function (char:string) {
                return decimalDigitFamily.indexOf(char) !== -1;
            }).length;
            const scalingFactor = minimumIntegerPartSize;
            const fractionalPartArray = parts.fractionalPart.split('');
            var minimumFactionalPartSize = fractionalPartArray.filter(function (char) {
                return decimalDigitFamily.indexOf(char) !== -1;
            }).length;
            var maximumFactionalPartSize = fractionalPartArray.filter(function (char) {
                return decimalDigitFamily.indexOf(char) !== -1 || char === properties.digit;
            }).length;
            var exponentPresent = typeof parts.exponentPart === 'string';
            if (minimumIntegerPartSize === 0 && maximumFactionalPartSize === 0) {
                if (exponentPresent) {
                    minimumFactionalPartSize = 1;
                    maximumFactionalPartSize = 1;
                } else {
                    minimumIntegerPartSize = 1;
                }
            }
            if (exponentPresent && minimumIntegerPartSize === 0 && parts.integerPart.indexOf(properties.digit) !== -1) {
                minimumIntegerPartSize = 1;
            }
            if (minimumIntegerPartSize === 0 && minimumFactionalPartSize === 0) {
                minimumFactionalPartSize = 1;
            }
            var minimumExponentSize = 0;
            if (exponentPresent) {
                minimumExponentSize = parts.exponentPart.split('').filter(function (char) {
                    return decimalDigitFamily.indexOf(char) !== -1;
                }).length;
            }

            return {
                integerPartGroupingPositions: integerPartGroupingPositions,
                regularGrouping: regularGrouping,
                minimumIntegerPartSize: minimumIntegerPartSize,
                scalingFactor: scalingFactor,
                prefix: parts.prefix,
                fractionalPartGroupingPositions: fractionalPartGroupingPositions,
                minimumFactionalPartSize: minimumFactionalPartSize,
                maximumFactionalPartSize: maximumFactionalPartSize,
                minimumExponentSize: minimumExponentSize,
                suffix: parts.suffix,
                picture: parts.subpicture
            };
        };

        const parts = subPictures.map(splitParts);
        parts.forEach(validate);

        const variables = parts.map(analyse);

        const minus_sign = properties['minus-sign'];
        const zero_digit = properties['zero-digit'];
        const decimal_separator = properties['decimal-separator'];
        const grouping_separator = properties['grouping-separator'];

        if (variables.length === 1) {
            variables.push(JSON.parse(JSON.stringify(variables[0])));
            variables[1].prefix = minus_sign + variables[1].prefix;
        }

        // TODO cache the result of the analysis

        // format the number
        // bullet 1: TODO: NaN - not sure we'd ever get this in JSON
        let pic: {
            prefix: string;
            suffix: string;
            minimumIntegerPartSize: number;
            minimumFactionalPartSize: number;
            maximumFactionalPartSize: number;
            minimumExponentSize: number;
            scalingFactor: number;
            regularGrouping: number;
            integerPartGroupingPositions: number[];
            fractionalPartGroupingPositions: number[];
            picture: string;
        };
        // bullet 2:
        if (value >= 0) {
            pic = variables[0];
        } else {
            pic = variables[1];
        }
        let adjustedNumber: number;
        // bullet 3:
        if (pic.picture.indexOf(properties.percent) !== -1) {
            adjustedNumber = value * 100;
        } else if (pic.picture.indexOf(properties['per-mille']) !== -1) {
            adjustedNumber = value * 1000;
        } else {
            adjustedNumber = value;
        }
        // bullet 4:
        // TODO: infinity - not sure we'd ever get this in JSON
        // bullet 5:
        let mantissa: number, exponent: number | undefined;
        if (pic.minimumExponentSize === 0) {
            mantissa = adjustedNumber;
        } else {
            // mantissa * 10^exponent = adjustedNumber
            var maxMantissa = Math.pow(10, pic.scalingFactor);
            var minMantissa = Math.pow(10, pic.scalingFactor - 1);
            mantissa = adjustedNumber;
            exponent = 0;
            while (mantissa < minMantissa) {
                mantissa *= 10;
                exponent -= 1;
            }
            while (mantissa > maxMantissa) {
                mantissa /= 10;
                exponent += 1;
            }
        }
        // bullet 6:
        const roundedNumber = this.round(mantissa, pic.maximumFactionalPartSize);
        // bullet 7:
        const makeString = function (value: number, dp: number): string {
            var str = Math.abs(value).toFixed(dp);
            if (zero_digit !== '0') {
                str = str.split('').map(function (digit) {
                    if (digit >= '0' && digit <= '9') {
                        return decimalDigitFamily[digit.charCodeAt(0) - 48];
                    } else {
                        return digit;
                    }
                }).join('');
            }
            return str;
        };
        let stringValue = makeString(roundedNumber, pic.maximumFactionalPartSize);
        let decimalPos = stringValue.indexOf('.');
        if (decimalPos === -1) {
            stringValue = stringValue + decimal_separator;
        } else {
            stringValue = stringValue.replace('.', decimal_separator);
        }
        while (stringValue.charAt(0) === zero_digit) {
            stringValue = stringValue.substring(1);
        }
        while (stringValue.charAt(stringValue.length - 1) === zero_digit) {
            stringValue = stringValue.substring(0, stringValue.length - 1);
        }
        // bullets 8 & 9:
        decimalPos = stringValue.indexOf(decimal_separator);
        var padLeft = pic.minimumIntegerPartSize - decimalPos;
        var padRight = pic.minimumFactionalPartSize - (stringValue.length - decimalPos - 1);
        stringValue = (padLeft > 0 ? new Array(padLeft + 1).join(zero_digit) : '') + stringValue;
        stringValue = stringValue + (padRight > 0 ? new Array(padRight + 1).join(zero_digit) : '');
        decimalPos = stringValue.indexOf(decimal_separator);
        // bullet 10:
        if (pic.regularGrouping > 0) {
            var groupCount = Math.floor((decimalPos - 1) / pic.regularGrouping);
            for (var group = 1; group <= groupCount; group++) {
                stringValue = [stringValue.slice(0, decimalPos - group * pic.regularGrouping), grouping_separator, stringValue.slice(decimalPos - group * pic.regularGrouping)].join('');
            }
        } else {
            pic.integerPartGroupingPositions.forEach(function (pos) {
                stringValue = [stringValue.slice(0, decimalPos - pos), grouping_separator, stringValue.slice(decimalPos - pos)].join('');
                decimalPos++;
            });
        }
        // bullet 11:
        decimalPos = stringValue.indexOf(decimal_separator);
        pic.fractionalPartGroupingPositions.forEach(function (pos) {
            stringValue = [stringValue.slice(0, pos + decimalPos + 1), grouping_separator, stringValue.slice(pos + decimalPos + 1)].join('');
        });
        // bullet 12:
        decimalPos = stringValue.indexOf(decimal_separator);
        if (pic.picture.indexOf(decimal_separator) === -1 || decimalPos === stringValue.length - 1) {
            stringValue = stringValue.substring(0, stringValue.length - 1);
        }
        // bullet 13:
        if (typeof exponent !== 'undefined') {
            var stringExponent = makeString(exponent, 0);
            padLeft = pic.minimumExponentSize - stringExponent.length;
            if (padLeft > 0) {
                stringExponent = new Array(padLeft + 1).join(zero_digit) + stringExponent;
            }
            stringValue = stringValue + properties['exponent-separator'] + (exponent < 0 ? minus_sign : '') + stringExponent;
        }
        // bullet 14:
        stringValue = pic.prefix + stringValue + pic.suffix;
        return stringValue;
    }

    /**
     * Converts a number to a string using a specified number base
     * @param {number} value - the number to convert
     * @param {number} [radix] - the number base; must be between 2 and 36. Defaults to 10
     * @returns {string} - the converted string
     */
    static formatBase(value, radix) {
        // undefined inputs always return undefined
        if (typeof value === 'undefined') {
            return undefined;
        }

        value = this.round(value);

        if (typeof radix === 'undefined') {
            radix = 10;
        } else {
            radix = this.round(radix);
        }

        if (radix < 2 || radix > 36) {
            throw {
                code: 'D3100',
                stack: (new Error()).stack,
                value: radix
            };

        }

        var result = value.toString(radix);

        return result;
    }

    /**
     * Cast argument to number
     * @param {Object} arg - Argument
     * @returns {Number} numeric value of argument
     */
    static number(arg) {
        var result;

        // undefined inputs always return undefined
        if (typeof arg === 'undefined') {
            return undefined;
        }

        if (typeof arg === 'number') {
            // already a number
            result = arg;
        } else if (typeof arg === 'string' && /^-?[0-9]+(\.[0-9]+)?([Ee][-+]?[0-9]+)?$/.test(arg) && !isNaN(parseFloat(arg)) && isFinite(parseFloat(arg))) {
            result = parseFloat(arg);
        } else if (typeof arg === 'string' && /^(0[xX][0-9A-Fa-f]+)|(0[oO][0-7]+)|(0[bB][0-1]+)$/.test(arg)) {
            result = Number(arg);
        } else if (arg === true) {
            // boolean true casts to 1
            result = 1;
        } else if (arg === false) {
            // boolean false casts to 0
            result = 0;
        } else {
            throw {
                code: "D3030",
                value: arg,
                stack: (new Error()).stack,
                index: 1
            };
        }
        return result;
    }

    /**
     * Absolute value of a number
     * @param {Number} arg - Argument
     * @returns {Number} absolute value of argument
     */
    static abs(arg) {
        var result;

        // undefined inputs always return undefined
        if (typeof arg === 'undefined') {
            return undefined;
        }

        result = Math.abs(arg);
        return result;
    }

    /**
     * Rounds a number down to integer
     * @param {Number} arg - Argument
     * @returns {Number} rounded integer
     */
    static floor(arg) {
        var result;

        // undefined inputs always return undefined
        if (typeof arg === 'undefined') {
            return undefined;
        }

        result = Math.floor(arg);
        return result;
    }

    /**
     * Rounds a number up to integer
     * @param {Number} arg - Argument
     * @returns {Number} rounded integer
     */
    static ceil(arg) {
        var result;

        // undefined inputs always return undefined
        if (typeof arg === 'undefined') {
            return undefined;
        }

        result = Math.ceil(arg);
        return result;
    }

    /**
     * Round to half even
     * @param {Number} arg - Argument
     * @param {Number} [precision] - number of decimal places
     * @returns {Number} rounded integer
     */
    static round(arg: number, precision?: number): number | undefined {
        var result: number;

        // undefined inputs always return undefined
        if (typeof arg === 'undefined') {
            return undefined;
        }

        if (precision) {
            // shift the decimal place - this needs to be done in a string since multiplying
            // by a power of ten can introduce floating point precision errors which mess up
            // this rounding algorithm - See 'Decimal rounding' in
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
            // Shift
            var value = arg.toString().split('e');
            arg = +(value[0] + 'e' + (value[1] ? (+value[1] + precision) : precision));
        }

        // round up to nearest int
        result = Math.round(arg);
        var diff = result - arg;
        if (Math.abs(diff) === 0.5 && Math.abs(result % 2) === 1) {
            // rounded the wrong way - adjust to nearest even number
            result = result - 1;
        }
        if (precision) {
            // Shift back
            value = result.toString().split('e');
            /* istanbul ignore next */
            result = +(value[0] + 'e' + (value[1] ? (+value[1] - precision) : -precision));
        }
        if (Object.is(result, -0)) { // ESLint rule 'no-compare-neg-zero' suggests this way
            // JSON doesn't do -0
            result = 0;
        }
        return result;
    }

    /**
     * Square root of number
     * @param {Number} arg - Argument
     * @returns {Number} square root
     */
    static sqrt(arg) {
        var result;

        // undefined inputs always return undefined
        if (typeof arg === 'undefined') {
            return undefined;
        }

        if (arg < 0) {
            throw {
                stack: (new Error()).stack,
                code: "D3060",
                index: 1,
                value: arg
            };
        }

        result = Math.sqrt(arg);

        return result;
    }

    /**
     * Raises number to the power of the second number
     * @param {Number} arg - the base
     * @param {Number} exp - the exponent
     * @returns {Number} rounded integer
     */
    static power(arg, exp) {
        var result;

        // undefined inputs always return undefined
        if (typeof arg === 'undefined') {
            return undefined;
        }

        result = Math.pow(arg, exp);

        if (!isFinite(result)) {
            throw {
                stack: (new Error()).stack,
                code: "D3061",
                index: 1,
                value: arg,
                exp: exp
            };
        }

        return result;
    }

    /**
     * Returns a random number 0 <= n < 1
     * @returns {number} random number
     */
    static random() {
        return Math.random();
    }

    /**
     * Evaluate an input and return a boolean
     * @param {*} arg - Arguments
     * @returns {boolean} Boolean
     */
    static boolean(arg: any): boolean | undefined {
        // cast arg to its effective boolean value
        // boolean: unchanged
        // string: zero-length -> false; otherwise -> true
        // number: 0 -> false; otherwise -> true
        // null -> false
        // array: empty -> false; length > 1 -> true
        // object: empty -> false; non-empty -> true
        // function -> false

        // undefined inputs always return undefined
        if (typeof arg === 'undefined') {
            return undefined;
        }

        let result = false;
        if (Array.isArray(arg)) {
            if (arg.length === 1) {
                result = this.boolean(arg[0])!;
            } else if (arg.length > 1) {
                const trues = arg.filter((val) => this.boolean(val)!);
                result = trues.length > 0;
            }
        } else if (typeof arg === 'string') {
            if (arg.length > 0) {
                result = true;
            }
        } else if (Utils.isNumeric(arg)) {
            if (arg !== 0) {
                result = true;
            }
        } else if (arg !== null && typeof arg === 'object') {
            if (Object.keys(arg).length > 0) {
                result = true;
            }
        } else if (typeof arg === 'boolean' && arg === true) {
            result = true;
        }
        return result;
    }

    /**
     * returns the Boolean NOT of the arg
     * @param {*} arg - argument
     * @returns {boolean} - NOT arg
     */
    static not(arg) {
        // undefined inputs always return undefined
        if (typeof arg === 'undefined') {
            return undefined;
        }

        return !this.boolean(arg);
    }

    /**
     * Helper function to build the arguments to be supplied to the function arg of the
     * HOFs map, filter, each, sift and single
     * @param {function} func - the function to be invoked
     * @param {*} arg1 - the first (required) arg - the value
     * @param {*} arg2 - the second (optional) arg - the position (index or key)
     * @param {*} arg3 - the third (optional) arg - the whole structure (array or object)
     * @returns {*[]} the argument list
     */
    static hofFuncArgs(func, arg1, arg2, arg3) {
        var func_args = [arg1]; // the first arg (the value) is required
        // the other two are optional - only supply it if the function can take it
        var length = Utils.getFunctionArity(func);
        if (length >= 2) {
            func_args.push(arg2);
        }
        if (length >= 3) {
            func_args.push(arg3);
        }
        return func_args;
    }

    /**
     * Create a map from an array of arguments
     * @param {Array} [arr] - array to map over
     * @param {Function} func - function to apply
     * @returns {Array} Map array
     */
    static async map(arr, func) {
        // undefined inputs always return undefined
        if (typeof arr === 'undefined') {
            return undefined;
        }

        var result = Utils.createSequence();
        // do the map - iterate over the arrays, and invoke func
        for (var i = 0; i < arr.length; i++) {
            var func_args = this.hofFuncArgs(func, arr[i], i, arr);
            // invoke func
            var res = await func.apply(this, func_args);
            if (typeof res !== 'undefined') {
                result.push(res);
            }
        }

        return result;
    }

    /**
     * Create a map from an array of arguments
     * @param {Array} [arr] - array to filter
     * @param {Function} func - predicate function
     * @returns {Array} Map array
     */
    static async filter(arr, func) {
        // undefined inputs always return undefined
        if (typeof arr === 'undefined') {
            return undefined;
        }

        var result = Utils.createSequence();

        for (var i = 0; i < arr.length; i++) {
            var entry = arr[i];
            var func_args = this.hofFuncArgs(func, entry, i, arr);
            // invoke func
            var res = await func.apply(this, func_args);
            if (this.boolean(res)) {
                result.push(entry);
            }
        }

        return result;
    }

    /**
     * Given an array, find the single element matching a specified condition
     * Throws an exception if the number of matching elements is not exactly one
     * @param {Array} [arr] - array to filter
     * @param {Function} [func] - predicate function
     * @returns {*} Matching element
     */
    static async single(arr, func) {
        // undefined inputs always return undefined
        if (typeof arr === 'undefined') {
            return undefined;
        }

        var hasFoundMatch = false;
        var result;

        for (var i = 0; i < arr.length; i++) {
            var entry = arr[i];
            var positiveResult = true;
            if (typeof func !== 'undefined') {
                var func_args = this.hofFuncArgs(func, entry, i, arr);
                // invoke func
                var res = await func.apply(this, func_args);
                positiveResult = this.boolean(res);
            }
            if (positiveResult) {
                if(!hasFoundMatch) {
                    result = entry;
                    hasFoundMatch = true;
                } else {
                    throw {
                        stack: (new Error()).stack,
                        code: "D3138",
                        index: i
                    };
                }
            }
        }

        if(!hasFoundMatch) {
            throw {
                stack: (new Error()).stack,
                code: "D3139"
            };
        }

        return result;
    }

    /**
     * Convolves (zips) each value from a set of arrays
     * @param {Array} [args] - arrays to zip
     * @returns {Array} Zipped array
     */
    static zip(): Array<any> {
        // this can take a variable number of arguments
        var result = [];
        var args = Array.prototype.slice.call(arguments);
        // length of the shortest array
        var length = Math.min.apply(Math, args.map(function (arg) {
            if (Array.isArray(arg)) {
                return arg.length;
            }
            return 0;
        }));
        for (var i = 0; i < length; i++) {
            var tuple = args.map((arg) => {
                return arg[i];
            });
            result.push(tuple);
        }
        return result;
    }

    /**
     * Fold left function
     * @param {Array} sequence - Sequence
     * @param {Function} func - Function
     * @param {Object} init - Initial value
     * @returns {*} Result
     */
    static async foldLeft<T, U>(
        sequence: Array<T>,
        func: (accumulator: U, current: T, index?: number, array?: Array<T>) => Promise<U> | U,
        init: U
    ): Promise<U | undefined> {
        // undefined inputs always return undefined
        if (typeof sequence === 'undefined') {
            return undefined;
        }

        let result: U;

        let arity = Utils.getFunctionArity(func);
        if (arity < 2) {
            throw {
                stack: (new Error()).stack,
                code: "D3050",
                index: 1
            };
        }

        let index: number;
        if (typeof init === 'undefined' && sequence.length > 0) {
            result = sequence[0] as unknown as U;
            index = 1;
        } else {
            result = init;
            index = 0;
        }

        while (index < sequence.length) {
            const args: [U, T, number?, Array<T>?] = [result, sequence[index]];
            if (arity >= 3) {
                args.push(index);
            }
            if (arity >= 4) {
                args.push(sequence);
            }
            result = await func.apply(this, args);
            index++;
        }

        return result;
    }

    /**
     * Return keys for an object
     * @param {Object} arg - Object
     * @returns {Array} Array of keys
     */
    static keys(arg: any): string[] | undefined {
        var result: string[] = Utils.createSequence();

        if (Array.isArray(arg)) {
            // merge the keys of all of the items in the array
            var merge: Record<string, boolean> = {};
            arg.forEach((item) => {
                var allkeys = this.keys(item);
                allkeys?.forEach((key) => {
                    merge[key] = true;
                });
            });
            result = this.keys(merge) || [];
        } else if (arg !== null && typeof arg === 'object' && !Utils.isFunction(arg)) {
            Object.keys(arg).forEach((key) => result.push(key));
        }
        return result.length > 0 ? result : undefined;
    }

    /**
     * Return value from an object for a given key
     * @param {Object} input - Object/Array
     * @param {String} key - Key in object
     * @returns {*} Value of key in object
     */
    static lookup(input: any, key: string): any {
        // lookup the 'name' item in the input
        var result: any;
        if (Array.isArray(input)) {
            result = Utils.createSequence();
            for (var ii = 0; ii < input.length; ii++) {
                var res = this.lookup(input[ii], key);
                if (typeof res !== 'undefined') {
                    if (Array.isArray(res)) {
                        res.forEach(val => result.push(val));
                    } else {
                        result.push(res);
                    }
                }
            }
        } else if (input !== null && typeof input === 'object' && !Utils.isFunction(input)) {
            result = input[key];
        }
        return result;
    }

    /**
     * Append second argument to first
     * @param {Array|Object} arg1 - First argument
     * @param {Array|Object} arg2 - Second argument
     * @returns {*} Appended arguments
     */
    static append(arg1, arg2) {
        // disregard undefined args
        if (typeof arg1 === 'undefined') {
            return arg2;
        }
        if (typeof arg2 === 'undefined') {
            return arg1;
        }
        // if either argument is not an array, make it so
        if (!Array.isArray(arg1)) {
            // arg1 = Utils.createSequence(arg1);
            arg1 = Utils.createSequence();
        }
        if (!Array.isArray(arg2)) {
            arg2 = [arg2];
        }
        return arg1.concat(arg2);
    }

    /**
     * Determines if the argument is undefined
     * @param {*} arg - argument
     * @returns {boolean} False if argument undefined, otherwise true
     */
    static exists(arg) {
        if (typeof arg === 'undefined') {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Splits an object into an array of object with one property each
     * @param {*} arg - the object to split
     * @returns {*} - the array
     */
    static spread(arg) {
        var result = Utils.createSequence();

        if (Array.isArray(arg)) {
            // spread all of the items in the array
            arg.forEach(function (item) {
                result = this.append(result, this.spread(item));
            });
        } else if (arg !== null && typeof arg === 'object' && !Utils.isLambda(arg)) {
            for (var key in arg) {
                var obj = {};
                obj[key] = arg[key];
                result.push(obj);
            }
        } else {
            result = arg;
        }
        return result;
    }

    /**
     * Merges an array of objects into a single object.  Duplicate properties are
     * overridden by entries later in the array
     * @param {*} arg - the objects to merge
     * @returns {*} - the object
     */
    static merge(arg) {
        // undefined inputs always return undefined
        if (typeof arg === 'undefined') {
            return undefined;
        }

        var result = {};

        arg.forEach(function (obj) {
            for (var prop in obj) {
                result[prop] = obj[prop];
            }
        });
        return result;
    }

    /**
     * Reverses the order of items in an array
     * @param {Array} arr - the array to reverse
     * @returns {Array} - the reversed array
     */
    static reverse(arr) {
        // undefined inputs always return undefined
        if (typeof arr === 'undefined') {
            return undefined;
        }

        if (arr.length <= 1) {
            return arr;
        }

        var length = arr.length;
        var result = new Array(length);
        for (var i = 0; i < length; i++) {
            result[length - i - 1] = arr[i];
        }

        return result;
    }

    /**
     * Iterates over an object and applies a function to each key/value pair
     * @param {*} obj - the input object to iterate over
     * @param {*} func - the function to apply to each key/value pair
     * @returns {Array} - the resultant array
     */
    static async each(obj, func) {
        var result = Utils.createSequence();

        for (var key in obj) {
            var func_args = this.hofFuncArgs(func, obj[key], key, obj);
            // invoke func
            var val = await func.apply(this, func_args);
            if(typeof val !== 'undefined') {
                result.push(val);
            }
        }

        return result;
    }

    
    /**
     * Evaluates an expression and throws an error
     * @param {string} [message] - the message to attach to the error
     * @throws custom error with code 'D3137'
     */
    static error(message: string): never {
        throw {
            code: "D3137",
            stack: (new Error()).stack,
            message: message || "$error() function evaluated"
        };
    }

    /**
     *
     * @param {boolean} condition - the condition to evaluate
     * @param {string} [message] - the message to attach to the error
     * @throws custom error with code 'D3137'
     * @returns {undefined}
     */
    static assert(condition, message) {
        if(!condition) {
            throw {
                code: "D3141",
                stack: (new Error()).stack,
                message: message || "$assert() statement failed"
            };
        }

        return undefined;
    }

    /**
     *
     * @param {*} [value] - the input to which the type will be checked
     * @returns {string} - the type of the input
     */
    static type(value) {
        if (value === undefined) {
            return undefined;
        }

        if (value === null) {
            return 'null';
        }

        if (Utils.isNumeric(value)) {
            return 'number';
        }

        if (typeof value === 'string') {
            return 'string';
        }

        if (typeof value === 'boolean') {
            return 'boolean';
        }

        if(Array.isArray(value)) {
            return 'array';
        }

        if(Utils.isFunction(value)) {
            return 'function';
        }

        return 'object';
    }

    /**
     * Implements the merge sort (stable) with optional comparator function
     *
     * @param {Array} arr - the array to sort
     * @param {*} comparator - comparator function
     * @returns {Array} - sorted array
     */
    static async sort<T>(arr: T[], comparator?: (a: T, b: T) => Promise<boolean> | boolean): Promise<T[] | undefined> {
        // undefined inputs always return undefined
        if (typeof arr === 'undefined') {
            return undefined;
        }

        if (arr.length <= 1) {
            return arr;
        }

        var comp: (a: T, b: T) => Promise<boolean>;
        if (typeof comparator === 'undefined') {
            // inject a default comparator - only works for numeric or string arrays
            if (!Utils.isArrayOfNumbers(arr) && !Utils.isArrayOfStrings(arr)) {
                throw {
                    stack: (new Error()).stack,
                    code: "D3070",
                    index: 1
                };
            }

            comp = async function (a: T, b: T): Promise<boolean> {
                return a > b;
            };
        } else {
            // for internal usage of functionSort (i.e. order-by syntax)
            comp = async (a: T, b: T): Promise<boolean> => {
                const result = comparator(a, b);
                return result instanceof Promise ? await result : result;
            };
        }

        const merge = async function (
            l: T[],
            r: T[]
        ): Promise<T[]> {
            var merge_iter = async function (
                result: T[],
                left: T[],
                right: T[]
            ): Promise<void> {
                if (left.length === 0) {
                    Array.prototype.push.apply(result, right);
                } else if (right.length === 0) {
                    Array.prototype.push.apply(result, left);
                } else if (await comp(left[0], right[0])) { // invoke the comparator function
                    // if it returns true - swap left and right
                    result.push(right[0]);
                    await merge_iter(result, left, right.slice(1));
                } else {
                    // otherwise keep the same order
                    result.push(left[0]);
                    await merge_iter(result, left.slice(1), right);
                }
            };
            var merged: T[] = [];
            await merge_iter(merged, l, r);
            return merged;
        };

        const msort = async function (array: T[]): Promise<T[]> {
            if (!Array.isArray(array) || array.length <= 1) {
                return array;
            } else {
                var middle = Math.floor(array.length / 2);
                var left = array.slice(0, middle);
                var right = array.slice(middle);
                left = await msort(left);
                right = await msort(right);
                return await merge(left, right);
            }
        };

        var result = await msort(arr);

        return result;
    }

    /**
     * Randomly shuffles the contents of an array
     * @param {Array} arr - the input array
     * @returns {Array} the shuffled array
     */
    static shuffle<T>(arr: T[]): T[] | undefined {
        // undefined inputs always return undefined
        if (typeof arr === 'undefined') {
            return undefined;
        }

        if (arr.length <= 1) {
            return arr;
        }

        // shuffle using the 'inside-out' variant of the Fisher-Yates algorithm
        var result = new Array<T>(arr.length);
        for (var i = 0; i < arr.length; i++) {
            var j = Math.floor(Math.random() * (i + 1)); // random integer such that 0 ≤ j ≤ i
            if (i !== j) {
                result[i] = result[j];
            }
            result[j] = arr[i];
        }

        return result;
    }

    /**
     * Returns the values that appear in a sequence, with duplicates eliminated.
     * @param {Array} arr - An array or sequence of values
     * @returns {Array} - sequence of distinct values
     */
    static distinct(arr: any[]): any[] | undefined {
        // undefined inputs always return undefined
        if (typeof arr === 'undefined') {
            return undefined;
        }

        if (!Array.isArray(arr) || arr.length <= 1) {
            return arr;
        }

        var results = Utils.isSequence(arr) ? Utils.createSequence() : [];

        for (var ii = 0; ii < arr.length; ii++) {
            var value = arr[ii];
            // is this value already in the result sequence?
            var includes = false;
            for (var jj = 0; jj < results.length; jj++) {
                if (Utils.isDeepEqual(value, results[jj])) {
                    includes = true;
                    break;
                }
            }
            if (!includes) {
                results.push(value);
            }
        }
        return results;
    }

    /**
     * Applies a predicate function to each key/value pair in an object, and returns an object containing
     * only the key/value pairs that passed the predicate
     *
     * @param {Record<string, any>} arg - the object to be sifted
     * @param {(value: any, key: string, obj: Record<string, any>) => boolean | Promise<boolean>} func - the predicate function (lambda or native)
     * @returns {Promise<Record<string, any> | undefined>} - sifted object or undefined if no key/value pairs pass the predicate
     */
    static async sift(
        arg: Record<string, any>,
        func: (value: any, key: string, obj: Record<string, any>) => boolean | Promise<boolean>
    ): Promise<Record<string, any> | undefined> {
        let result: Record<string, any> = {};
        for (var item in arg) {
            var entry = arg[item];
            var func_args = this.hofFuncArgs(func, entry, item, arg);
            // invoke func
            var res = await func.apply(this, func_args);
            if (this.boolean(res)) {
                result[item] = entry;
            }
        }

        // empty objects should be changed to undefined
        if (Object.keys(result).length === 0) {
            result = undefined;
        }

        return result;
    }
}

namespace jsonata {
    export type functions = typeof Functions;
}