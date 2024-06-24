import { log } from "cc";

const CACHE_KEY = '__ccclassCache__';

export function makeSmartClassDecorator<TArg> (
    decorate: <TFunction extends Function>(constructor: TFunction, arg?: TArg) => ReturnType<ClassDecorator>,
): ClassDecorator & ((arg?: TArg) => ClassDecorator) {
    return proxyFn;
    function proxyFn(...args: Parameters<ClassDecorator>): ReturnType<ClassDecorator>;
    function proxyFn(arg?: TArg): ClassDecorator;
    function proxyFn (target?: Parameters<ClassDecorator>[0] | TArg): ReturnType<ClassDecorator> {
        if (typeof target === 'function') {
            // If no parameter specified
            return decorate(target);
        } else {
            return function <TFunction extends Function> (constructor: TFunction): void | Function {
                return decorate(constructor, target);
            };
        }
    }
}


// export const propertyDynamicLoading: ((name?: string) => ClassDecorator) & ClassDecorator = makeSmartClassDecorator<string>((constructor, name) => {
//     const cache = constructor[CACHE_KEY];
//     if (cache) {
//         const decoratedProto = cache.proto;
//         if (decoratedProto) {
//             // decoratedProto.properties = createProperties(ctor, decoratedProto.properties);
//             const keys:string[] = Object.keys(decoratedProto.properties);
//             keys.forEach((key:string)=>{
//                 remakeProperties(constructor, key)
//             })
            
//         }
//     }

//     return constructor //Referencify(constructor)
// });




