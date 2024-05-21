import { _decorator, Component, Node, sys } from 'cc';


const { ccclass, property } = _decorator;

const breaker = {};
const ArrayProto = Array.prototype;
const ObjProto = Object.prototype;
const FuncProto = Function.prototype;

// const push             = ArrayProto.push;
// const slice            = ArrayProto.slice;
// const concat           = ArrayProto.concat;
// const toString         = ObjProto.toString;
// const hasOwnProperty   = ObjProto.hasOwnProperty;

// const nativeForEach      = ArrayProto.forEach;
// const nativeMap          = ArrayProto.map;
// const nativeReduce       = ArrayProto.reduce;
// const nativeReduceRight  = ArrayProto.reduceRight;
// const nativeFilter       = ArrayProto.filter;
// const nativeEvery        = ArrayProto.every;
// const nativeSome         = ArrayProto.some;
// const nativeIndexOf      = ArrayProto.indexOf;
// const nativeLastIndexOf  = ArrayProto.lastIndexOf;
// const nativeIsArray      = Array.isArray;
// const nativeKeys         = Object.keys;
// const nativeBind         = FuncProto.bind;

const DB_PREFIX:string = 'cocoseus_'

// @ccclass('CollectionItem')
// export class CollectionItem {
//     private __collection:string
//     private _id
//     constructor(collectionName:string, fields){
//         this.__collection = collectionName;
//         LocalDatabase.extend(this, fields);
//     }

//     save(){
//         let items:any = sys.localStorage.getItem(DB_PREFIX+ this.__collection);
//         if(items){
//             items = JSON.parse(items);
//         } else {
//             items = [];
//         }
//         // 
//         if(this._id){
//             if( items.length ){
//                 var updateItem = LocalDatabase.find(items, function(item){
//                   return item._id == self._id;
//                 });
//                 if(updateItem){
//                     LocalDatabase.each(this, function(thisItem, key){
//                         if(key !== '__collection'){
//                         if(self[key] !== undefined){
//                             updateItem[key] = self[key];
//                         }
//                         }
//                     });
//                 }
//             }
//         } else {
//             this._id = LocalDatabase.uuid();
//             items.push(this);
//         }
//         // 

//     }
// }

// @ccclass('Collection')
// export class Collection {
//     private _collection;
//     private _name:string;
//     private _items

//     constructor(name:string){
//         this._name = name;
//         const collection:string = sys.localStorage.getItem(DB_PREFIX + this._name);
//         if(collection){
//             self.items = JSON.parse(collection);
//         } else {
//             self.items = [];
//             localStorage.setItem('LocalDB_'+name, '[]');
//         }

//         const _exists = LocalDatabase.find(LocalDatabase.collections, function(item){ return item === name; });
//         if(!_exists){
//             LocalDatabase.collections = LocalDatabase.collections || [];
//             LocalDatabase.collections.push(name);
//             localStorage.setItem('LocalDB', JSON.stringify(LocalDatabase.collections));
//         }
//     }
// }


/**
 * https://github.com/Agnostic/LocalDB.js
 */
// @ccclass('LocalDatabase')
// export class LocalDatabase {
//     static version = '1.0';
//     public static collections:any    

//     constructor(name:string = 'LocalDB'){
//         const collections:string = sys.localStorage.getItem(name);
//         if(!collections){
//             this.collections = [];
//             localStorage.setItem('LocalDB', JSON.stringify(this.collections));
//         }else{
//             this.collections = JSON.parse(collections)
//         }
//     }

//     private push:Function               = ArrayProto.push;
//     private slice:Function              = ArrayProto.slice;
//     private concat:Function             = ArrayProto.concat;
//     private toString:Function           = ObjProto.toString;
//     private hasOwnProperty:Function     = ObjProto.hasOwnProperty;
//     private nativeForEach:Function      = ArrayProto.forEach;
//     private nativeMap:Function          = ArrayProto.map;
//     private nativeReduce:Function       = ArrayProto.reduce;
//     private nativeReduceRight:Function  = ArrayProto.reduceRight;
//     private nativeFilter:Function       = ArrayProto.filter;
//     private nativeEvery:Function        = ArrayProto.every;
//     private nativeSome:Function         = ArrayProto.some;
//     private nativeIndexOf:Function      = ArrayProto.indexOf;
//     private nativeLastIndexOf:Function  = ArrayProto.lastIndexOf;
//     private nativeIsArray:Function      = Array.isArray;
//     private nativeKeys:Function         = Object.keys;
//     private nativeBind:Function         = FuncProto.bind;
//     public each:Function =  this.forEach;

//     protected collections:any;

//     public forEach(obj, iterator?, context?){
//         if (obj == null) return;
//         if (this.nativeForEach && obj.forEach === this.nativeForEach) {
//           obj.forEach(iterator, context);
//         } else if (obj.length === +obj.length) {
//           for (var i = 0, l = obj.length; i < l; i++) {
//             if (iterator.call(context, obj[i], i, obj) === breaker) return;
//           }
//         } else {
//           for (var key in obj) {
//             if (this.has(obj, key)) {
//               if (iterator.call(context, obj[key], key, obj) === breaker) return;
//             }
//           }
//         }
//     }

//     /**
//      * 
//      * @returns 
//      */
//     public s4(){
//         return Math.floor((1 + Math.random()) * 0x10000)
//                    .toString(16)
//                    .substring(1);
//     };

//     /**
//      * 
//      * @returns 
//      */
//     public uuid (){
//         return this.s4() + this.s4() + new Date().getTime() + this.s4();
//     };

//     /**
//      * 
//      * @param array 
//      * @param item 
//      * @param isSorted 
//      * @returns 
//      */
//     public indexOf (array:Array<any>, item, isSorted) {
//         if (array == null) return -1;
//         var i = 0, l = array.length;
//         if (isSorted) {
//           if (typeof isSorted == 'number') {
//             i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
//           } else {
//             i = this.sortedIndex(array, item);
//             return array[i] === item ? i : -1;
//           }
//         }
//         if (this.nativeIndexOf && array.indexOf === this.nativeIndexOf) return array.indexOf(item, isSorted);
//         for (; i < l; i++) if (array[i] === item) return i;
//         return -1;
//     };

//     /**
//      * 
//      * @param value 
//      * @returns 
//      */
//     protected identity (value) {
//         return value;
//     };

//     sortedIndex(array, obj, iterator, context?) {
//         iterator = iterator == null ? this.identity : lookupIterator(iterator);
//         var value = iterator.call(context, obj);
//         var low = 0, high = array.length;
//         while (low < high) {
//           var mid = (low + high) >>> 1;
//           iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
//         }
//         return low;
//     };


// }


