import { CCClass, Component, Constructor, error, js } from "cc";
import { cocoseus_types } from "./cocoseus.types";
import { cocoseus_cceditor} from "./cocoseus.cceditor";
import { DEV } from "cc/env";

const CCEditor = cocoseus_cceditor;
type DecorateHandlerType = cocoseus_types.DecorateHandlerType;
type DecoratePropertyType = cocoseus_types.DecoratePropertyType;
type PropertyStash = cocoseus_types.PropertyStash;
type ClassStash = cocoseus_types.ClassStash;
type validateTBase<T> = cocoseus_types.validateTBase<T>;
type SubConstructor<T, TSub> =  new (...args: any[]) => T & TSub;
// type ReturnInheritancified<T, TCtor> = T extends { __props__: unknown, __values__: unknown }? Constructor<T> : TCtor;

export namespace cocoseus_classify {
    
    const InjectorTag = Symbol() //'$injector';
    const CACHE_KEY = cocoseus_types.CACHE_KEY;
    

    /**
     * 
     * @param baseCtor 
     * @param injectorName 
     * @returns 
     */
    export function hadInjectorImplemented(baseCtor:Constructor, injectorName?:string):boolean{
        // if(!injectorName || !injectorName.length) return false;    
        if(!baseCtor) {
            return false;
        }    
        // return (baseCtor.name.indexOf(injectorName) !== -1) || 
        return (injectorName ? (baseCtor[InjectorTag] && baseCtor[InjectorTag].indexOf(injectorName) !== -1) : !!baseCtor[InjectorTag])  ? true : hadInjectorImplemented(js.getSuper(baseCtor), injectorName);    
    }

    /**
     * 
     * @param baseCtor 
     * @param injectorName 
     * @returns 
     */
    export function lastClassIsInjected(baseCtor:Constructor):boolean{
        // if(!injectorName || !injectorName.length) return false;    
        if(!baseCtor) {
            return false;
        }    
        return !!baseCtor[InjectorTag] //? true : lastClassIsInjected(js.getSuper(baseCtor))
    }



    export function getPolyfillClass(injectorName:string, baseCtor:Constructor, currentBaseCtorName:string = baseCtor.name):Constructor{
        if(!baseCtor) {
            error("Can not find the injector with the name " + injectorName + ". The class " + currentBaseCtorName + " need to be Inheritancified with " + injectorName + " injector.");
            return null;    
        }
        return (baseCtor[InjectorTag] && baseCtor[InjectorTag].indexOf(injectorName) !== -1) ? baseCtor : getPolyfillClass(injectorName, js.getSuper(baseCtor), currentBaseCtorName);
    }

    /**
     * 
     * Base on the new intergaraion method class which found on Coco Engine Source.
     * Main Idea is generatting a new class from the given base class, after polyfill all functionalities.
     * @param constructor 
     * @param additionalConstructor 
     * @returns 
     */
    // export function polyfillify<TClass>(injectorMethod:<TBase>(...args:Constructor<TBase>[])=>Constructor<TBase & TClass>, injectorName:string = injectorMethod.name ):(<TBase>(base:validateTBase<TBase>)=>SubConstructor<TBase, TClass>){
    //     return function<TBase>(base:validateTBase<TBase>, className:string = injectorName):SubConstructor<TBase, TClass>{
    //         if(!!base['__props__'] && !!base['__values__']){            
    //             // 
    //             if(hadInjectorImplemented(base as Constructor, injectorName)) return base as unknown as SubConstructor<TBase, TClass>;
    //             const superClass:SubConstructor<TBase, TClass> = implemenInjectorMethod(injectorMethod, injectorName, arguments);
    //             return superClass as unknown as SubConstructor<TBase, TClass>;
    //         }else{
    //             const ctor:Constructor = base.constructor as Constructor || base//|| Object.getPrototypeOf(base);
    //             // const injector:ReturnInheritancified<TBase&TClass, TStaticClass> = (geTClass(targeTClassName, ctor) || injectorMethod(ctor))  as unknown as SubConstructor<TBase, TClass> ;
    //             const injector:SubConstructor<TBase, TClass> = getPolyfillClass(className, ctor)   as unknown as SubConstructor<TBase, TClass> ;
    //             return injector;
    //         }
    //     } as <TBase>(base:validateTBase<TBase>)=>SubConstructor<TBase, TClass>
    // }

    /**
     * Update and modify the class from blueprints.
     * Cac class tao boi CCClassify khong duoc dang ky trong CCClass.
     * [Isssue] Chi su dung duoc 1 lan trong chuoi ke thua.
     * @param injectorMethod 
     * @param injectorName 
     * @returns 
     */
    export function CCClassify<TClass>(injectorMethod:<TBase>(...args:(Constructor<TBase>|string|number)[])=>Constructor<TBase & TClass>, injectorName:string = injectorMethod.name ):(<TBase>(base:validateTBase<TBase>, ...args:(string|number)[])=>SubConstructor<TBase, TClass>){
        return function<TBase>(base:validateTBase<TBase>):SubConstructor<TBase, TClass>{
            if(hadInjectorImplemented(base as Constructor, injectorName)) {
                return base as unknown as SubConstructor<TBase, TClass>;
            }
            //         
            let superClass:SubConstructor<TBase, TClass> = implemenInjectorMethod<TClass, SubConstructor<TBase, TClass>>(injectorMethod, injectorName, arguments);
            if(!superClass) {
                error('Please, declare the injector class and return it inside injector function !')
            }
            
            // Use base['__props__'] and base['__values__'] to identify classes that have already been initialized in @CCClass.
            // In the case where two classes are created consecutively from CCClassify, both base['__props__'] and base['__values__'] may exist.
            // Therefore, an additional check with lastClassIsInjected(base): boolean is needed.
            if(!!base['__props__'] && !!base['__values__'] && !lastClassIsInjected(base)){
                // The code below only works with initialized CCClass object.
                superClass = CCEditor.extendClassCache(superClass);
                applyCustomizedProperties(superClass as Constructor);
            }
            //  
            return superClass as unknown as SubConstructor<TBase, TClass>;
        } as <TBase>(base:validateTBase<TBase>)=>SubConstructor<TBase, TClass>;//ReturnInheritancified<TBase&TClass, Constructor<TBase&TClass>>
    }
    // export function make<TClass, TStaticClass = Constructor>(injectorMethod:<TBase>(...args:(Constructor<TBase>|string|number)[])=>Constructor<TBase & TClass>, injectorName:string = injectorMethod.name ):(<TBase>(base:validateTBase<TBase>, ...args:(string|number)[])=>ReturnInheritancified<TBase&TClass, TStaticClass>){
    //     return function<TBase>(base:validateTBase<TBase>):ReturnInheritancified<TBase&TClass, TStaticClass>{
    //         if(hadInjectorImplemented(base as Constructor, injectorName)) {
    //             return base as unknown as ReturnInheritancified<TBase&TClass, TStaticClass>;
    //         }
    //         //         
    //         let superClass:TStaticClass = implemenInjectorMethod<TClass, TStaticClass>(injectorMethod, injectorName, arguments);
    //         if(!superClass) {
    //             error('Please, declare the injector class and return it inside injector function !')
    //         }
            
    //         // Use base['__props__'] and base['__values__'] to identify classes that have already been initialized in @CCClass.
    //         // In the case where two classes are created consecutively from CCClassify, both base['__props__'] and base['__values__'] may exist.
    //         // Therefore, an additional check with lastClassIsInjected(base): boolean is needed.
    //         if(!!base['__props__'] && !!base['__values__'] && !lastClassIsInjected(base)){
    //             // The code below only works with initialized CCClass object.
    //             superClass = CCEditor.extendClassCache(superClass);
    //             applyCustomizedProperties(superClass as Constructor);
    //         }else{
    //             // const ctor:Constructor = base.constructor as Constructor || base//|| Object.getPrototypeOf(base);
    //             // // const injector:ReturnInheritancified<TBase&TInjector, TStaticInjector> = (getInjector(targetInjectorName, ctor) || injectorMethod(ctor))  as unknown as ReturnInheritancified<TBase&TInjector, TStaticInjector> ;
    //             // const injector:ReturnInheritancified<TBase&TClass, TStaticClass> = lastClassIsInjected(base) as ReturnInheritancified<TBase&TClass, TStaticClass> ;
    //             // return injector;
    //         }
    //         //  
    //         return superClass as unknown as ReturnInheritancified<TBase&TClass, TStaticClass>;
    //     } as <TBase>(base:validateTBase<TBase>)=>ReturnInheritancified<TBase&TClass, TStaticClass>
    // }


    /**
     * 
     * @param injectorMethod 
     * @param injectorName 
     * @param args 
     * @returns 
     */
    export function implemenInjectorMethod<TClass, TStaticClass>(injectorMethod:<TBase>(...args:Constructor<TBase>[])=>Constructor<TBase & TClass>, injectorName:string, args:any):TStaticClass{    
        const superClass:TStaticClass = injectorMethod.apply(this, Array.from(args));            
        const injector:string[]= superClass[InjectorTag] || (superClass[InjectorTag] ??= []);
        // superClass['extends'] = args[0]
        if(injector.indexOf(injectorName) == -1){   
            injector.push(injectorName);
        }
        // CCEditor.doDefine(injectorName+''+Math.random(), base, superClass);
        return superClass
    }

    /**
     * Execute functions assigned to __$extends
     * @param constructor 
     */
    export function applyCustomizedProperties(constructor:Constructor){
        try{
            const classStash:ClassStash = constructor[CACHE_KEY] || ((constructor[CACHE_KEY]) = {});
            const ccclassProto = CCEditor.getSubDict<ClassStash, keyof ClassStash>(classStash, 'proto');
            const properties:Record<string, PropertyStash> = CCEditor.getSubDict(ccclassProto, 'properties');
            const propertyKeys:string[] = Object.keys(properties);
            propertyKeys.forEach((key:string)=>{
                const propertyStash:PropertyStash = properties[key];
                if(propertyStash && propertyStash.__$extends && propertyStash.__$extends.length){                    
                    while(propertyStash.__$extends.length){
                        const executeDecoratorFunction:Function = propertyStash.__$extends.shift();
                        executeDecoratorFunction && executeDecoratorFunction(classStash, propertyStash, constructor, key)
                    }
                    delete propertyStash.__$extends;
                }

            });
        }catch(err){
            console.error('[Error applyCustomizedProperties]','err')
        }
    }
        
    /**
     * Constructor for each @property
     * Create a new decorator of the specified type. with a custom handler.
     * Whenever this property is declared, the handler will be called.
     * @param decoratorType              // default 'property' 
     * @param decoratorHandler           // This function is only called when the class is declared.
     * @returns 
     */
    export function generateCustomPropertyDecorator(decoratorType:string, decoratorHandler:DecorateHandlerType):DecoratePropertyType{ 
        return CCEditor.generatePropertyDecorator(decoratorType, function( 
            cache?:ClassStash, 
            propertyStash?:PropertyStash, 
            ctor?: new ()=>unknown, 
            propertyKey?:string|symbol,
        ){
            if(DEV){
                cache;
                ctor;
                propertyKey
            }
            // 
            if(!propertyStash.__$extends) {
                propertyStash.__$extends = [];
            }
            propertyStash.__$extends.push(decoratorHandler);
            // 
        }) as DecoratePropertyType
    }

    /**
     * The function remakes all properties when declaring a class.
     * Adds the decoratorHandler(..) function to the __$extends tag for each corresponding property with the same decorator name (__$decorate).
     * @param decoratorType 
     * @param decoratorHandler 
     * @returns 
     */
    export function remakePropertyDecorator(constructor:Constructor, decoratorType:string, decoratorHandler:DecorateHandlerType){    
        if(!constructor) {
            throw new Error('this function have to call with constructor.')
        }
        const classStash:ClassStash = constructor[CACHE_KEY] || ((constructor[CACHE_KEY]) = {});
        const ccclassProto = CCEditor.getSubDict<ClassStash, keyof ClassStash>(classStash, 'proto');
        const properties:Record<string, PropertyStash> = CCEditor.getSubDict(ccclassProto, 'properties');     
        const propertyKeys:string[] = Object.keys(properties);
        propertyKeys.forEach((key:string|symbol)=>{     
            const propertyStash:PropertyStash = properties[key.toString()];
            if(!propertyStash.__$decorate) {
                propertyStash.__$decorate = 'property';
            }   
            if( propertyStash && propertyStash.__$decorate == decoratorType.toString()){
                // 
                if(!propertyStash.__$extends) {
                    propertyStash.__$extends = [];
                }
                propertyStash.__$extends.push(decoratorHandler);
                // 
            }
        });       
        return
    }

}

