import { error } from 'cc';
import { js } from 'cc';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;



// u00C0-u00FF is latin characters
// u0621-u064a is arabic letters
// u0660-u0669 is arabic numerals
// TODO: figure out way to do this for more languages
const _nonWordRe = /[^a-zA-Z0-9\u00C0-\u00FF\u0621-\u064A\u0660-\u0669, ]+/g;

const GramSizeLower:number = 2;
const GramSizeUpper :number = 2;
const UseLevenshtein:number|boolean = 1;
const DefaultArray:string[] = []

class SearchingMath {    
    private levenshtein (str1:string, str2:string):number {
        const current = [];
        let prev:number;
        let value:number;
        for (let i:number = 0; i <= str2.length; i++){
            for (let j:number = 0; j <= str1.length; j++) {
                if (i && j){
                    if (str1.charAt(j - 1) === str2.charAt(i - 1)){
                        value = prev;
                    }else{
                        value = Math.min(current[j], current[j - 1], prev) + 1;
                    }
                } else {
                    value = i + j;
                }
                prev = current[j];
                current[j] = value;
            }
        }
        return current.pop();
    };

    protected distance (str1:string, str2:string) {
        if (str1 === null && str2 === null) throw 'Trying to compare two null values';
        if (str1 === null || str2 === null) return 0;
        str1 = String(str1); str2 = String(str2);

        var distance:number = this.levenshtein(str1, str2);
        if (str1.length > str2.length) {
            return 1 - distance / str1.length;
        } else {
            return 1 - distance / str2.length;
        }
    };

    protected iterateGrams (value:string, gramSize:number):string[] {
        gramSize = gramSize || 2;
        let simplified:string = '-' + value.toLowerCase().replace(_nonWordRe, '') + '-';
        const lenDiff = gramSize - simplified.length;
        const results = [];
        if (lenDiff > 0) {
            for (let i:number = 0; i < lenDiff; ++i) {
                simplified += '-';
            }
        }
        for (let i:number = 0; i < simplified.length - gramSize + 1; ++i) {
            results.push(simplified.slice(i, i + gramSize));
        }
        return results;
    };

    protected gramCounter (value:string, gramSize:number):object {
        // return an object where key=gram, value=number of occurrences
        gramSize = gramSize || 2;
        const result = {};
        const grams:string[] = this.iterateGrams(value, gramSize);
        let i:number = 0;
        for (i; i < grams.length; ++i) {
            if (grams[i] in result) {
                result[grams[i]] += 1;
            } else {
                result[grams[i]] = 1;
            }
        }
        return result;
    };
}


@ccclass('SearchingSet')
export class SearchingSet extends SearchingMath{

    private gramSizeLower:number = GramSizeLower || 2;

    private gramSizeUpper:number = GramSizeUpper || 3;

    private useLevenshtein = (typeof UseLevenshtein !== 'boolean') ? true : UseLevenshtein;

    private exactSet = Object.create(null);

    private matchDict = Object.create(null);

    private items  = Object.create(null);

    private arr = DefaultArray || [];

    private _defaultMinScore:number = 0.33;

    constructor(){
        super();
        let i:number = this.gramSizeLower;
        for (i; i < this.gramSizeUpper + 1; ++i) {
            this.items[i] = [];
        }
        // add all the items to the set
        for (i = 0; i < this.arr.length; ++i) {
            this.add(this.arr[i]);
        }
    }

    public get(value:string, defaultValue?:string, minMatchScore?:number):any[]{
        // check for value in set, returning defaultValue or null if none found
        if (minMatchScore === undefined) {
            minMatchScore = this._defaultMinScore;
        }
        var result = this._get(value, minMatchScore);
        if (!result && typeof defaultValue !== 'undefined') {
            return [defaultValue];
        }
        return result;
    }

    public add(value:string) {
        let normalizedValue:string = this._normalizeStr(value);
        if (normalizedValue in this.exactSet) {
            return false;
        }
        let i:number = this.gramSizeLower;
        for (i; i < this.gramSizeUpper + 1; ++i) {
            this._add(value, i);
        }
    }

    public setMinScore(minScore:number){
        this._defaultMinScore = minScore;
    }

    // public delete(value:string){
    //     let normalizedValue:string = this._normalizeStr(value);
    //     if (normalizedValue in this.exactSet) {
    //         delete this.exactSet[normalizedValue];
    //     }
    // }

    public length() {
        let count = 0;
        let prop:string;
        for (prop in this.exactSet) {
            if (Object.prototype.hasOwnProperty.call(this.exactSet, prop)) {
                count += 1;
            }
        }
        return count;
    };

    public isEmpty() {
        for (var prop in this.exactSet) {            
            if (Object.prototype.hasOwnProperty.call(this.exactSet, prop)) {
                return false;
            }
        }
        return true;
    }

    public values():string[] {
        const values = [];
        let prop:string;
        for (prop in this.exactSet) {
            if (Object.prototype.hasOwnProperty.call(this.exactSet, prop)) {
                values.push(this.exactSet[prop]);
            }
        }
        return values;
    }

    
    protected _get(value:string, minMatchScore:number):any[] {
        let results:any[] = [];
        // start with high gram size and if there are no results, go to lower gram sizes
        for (let gramSize:number = this.gramSizeUpper; gramSize >= this.gramSizeLower; --gramSize) {
            results = this.__get(value, gramSize, minMatchScore);
            if (results && results.length > 0) {
                return results;
            }
        }
        return null;
    };

    protected __get(value:string, gramSize:number, minMatchScore:number):any[] {
        const normalizedValue:string = this._normalizeStr(value);
        const matches:object = Object.create(null);
        const gramCounts:object = this.gramCounter(normalizedValue, gramSize);
        const items:any[] = this.items[gramSize];
        // 
        let sumOfSquareGramCounts:number = 0;
        let gram:string;
        let gramCount:number;
        let i:number;
        let index:number;
        let otherGramCount:number;
        // 
        for (gram in gramCounts) {
            gramCount = gramCounts[gram];
            sumOfSquareGramCounts += Math.pow(gramCount, 2);
            if (gram in this.matchDict) {
                for (i = 0; i < this.matchDict[gram].length; ++i) {
                    index = this.matchDict[gram][i][0];
                    otherGramCount = this.matchDict[gram][i][1];
                    if (index in matches) {
                        matches[index] += gramCount * otherGramCount;
                    } else {
                        matches[index] = gramCount * otherGramCount;
                    }
                }
            }
        }

        if (js.isEmptyObject(matches)) {
            return null;
        }

        const vectorNormal:number = Math.sqrt(sumOfSquareGramCounts);
        let results = [];
        let matchScore:number;
        // build a results list of [score, str]
        for (let matchIndex in matches) {
            matchScore = matches[matchIndex];
            results.push([matchScore / (vectorNormal * items[matchIndex][0]), items[matchIndex][1]]);
        }
        // 
        const sortDescending = function(a:any[], b:any[]) {
            if (a[0] < b[0]) {
                return 1;
            } else if (a[0] > b[0]) {
                return -1;
            } else {
                return 0;
            }
        };
        results.sort(sortDescending);
        if (this.useLevenshtein) {
            var newResults = [],
                endIndex = Math.min(50, results.length);
            // truncate somewhat arbitrarily to 50
            for (let i = 0; i < endIndex; ++i) {
                newResults.push([this.distance(results[i][1], normalizedValue), results[i][1]]);
            }
            results = newResults;
            results.sort(sortDescending);
        }
        newResults = [];
        results.forEach(function(scoreWordPair:any[]) {
            if (scoreWordPair[0] >= minMatchScore) {
                newResults.push([scoreWordPair[0], this.exactSet[scoreWordPair[1]]]);
            }
        }.bind(this));
        return newResults;
    }

    /**
     * 
     * @param value 
     * @param gramSize 
     */
    protected _add (value:string, gramSize:number) {
        const normalizedValue:string = this._normalizeStr(value);
        const items:any[] = this.items[gramSize] || [];
        const index:number = items.length;
        items.push(0);

        const gramCounts:object = this.gramCounter(normalizedValue, gramSize);
        let sumOfSquareGramCounts:number = 0;
        let gram:string;
        let gramCount:number;
        for (gram in gramCounts) {
            gramCount = gramCounts[gram];
            sumOfSquareGramCounts += Math.pow(gramCount, 2);
            if (gram in this.matchDict) {
                this.matchDict[gram].push([index, gramCount]);
            } else {
                this.matchDict[gram] = [[index, gramCount]];
            }
        }
        const vectorNormal:number = Math.sqrt(sumOfSquareGramCounts);
        items[index] = [vectorNormal, normalizedValue];
        this.items[gramSize] = items;
        this.exactSet[normalizedValue] = value;
    }

    protected _normalizeStr (str:string):string {
        if (Object.prototype.toString.call(str) !== '[object String]') {
            error('error str :: ' + str);
            throw 'Must use a string as argument to FuzzySet functions';
        }
        return str.toLowerCase();
    }

}


