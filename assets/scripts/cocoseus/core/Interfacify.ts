import { _decorator, CCClass, CCString, Component, Constructor, js, log, Node, warn } from 'cc';
import { IInterfacified, IReferencified, IStaticDecoratified, IStaticInterfacified } from '../types/CoreType';
import { getInjector, hadInjectorImplemented, Inheritancify } from './Inheritancify';
import Referencify, { reference } from './Referencify';
import Decoratify from './Decoratify';
const { ccclass, property } = _decorator;

/**
 * 
 */
export default Inheritancify<IInterfacified, IStaticInterfacified>(function Interfacify <TBase>(base:Constructor<TBase>):Constructor<TBase & IInterfacified>{
    const compName:string = base?.name;
    const callbacksInvokerPrototype = base.prototype;
    // log('compName ' + compName)
    // class Interfacified extends Component implements IInterfacified {      
        
    //     // /**
    //     //  * 
    //     //  */
    //     public get internalOnLoad (): (() => void) | undefined {
    //         log('interface implement !!!!')
    //         return super['internalOnLoad']
    //     }

    //     // /**
    //     //  * 
    //     //  */
    //     // public get internalOnStart (): (() => void) | undefined {
    //     //     return super['internalOnStart']
    //     // }        
    // }
    //     
    if(hadInjectorImplemented(base, 'Referencify')){
        const propertyKeys:string[] = (getInjector('Decoratify', base) as IStaticDecoratified).keys('@reference');
        if(!propertyKeys || !propertyKeys.length) return null;
        // const baseClass:Constructor<IReferencified> = Referencify(Component as unknown as Constructor<Component>);
        // 
        class Interfacified extends Decoratify(Component) implements IInterfacified {      
            
            // /**
            //  * 
            //  */
            public get internalOnLoad (): (() => void) | undefined {
                log('interface implement !!!!' + this);
                // 

                // 
                return super['internalOnLoad'];
            }
    
            // /**
            //  * 
            //  */
            // public get internalOnStart (): (() => void) | undefined {
            //     return super['internalOnStart']
            // }        
        }
        //         
        const interfacePrototype:IInterfacified = Interfacified.prototype;
        propertyKeys.forEach((propertyKey:string)=>{            
            if (!(propertyKey in interfacePrototype)) {                
                const propertyDescriptor:PropertyDescriptor = Object.getOwnPropertyDescriptor(callbacksInvokerPrototype, propertyKey);
                const inheritanceChain = CCClass.getInheritanceChain(interfacePrototype);
                const propertyIsExisted:boolean = !!inheritanceChain.some((x) => x.prototype.hasOwnProperty(propertyKey));
                if(!!propertyDescriptor && !propertyIsExisted){
                    if (!((propertyDescriptor.value && typeof propertyDescriptor.value !== 'function') || propertyDescriptor.get || propertyDescriptor.set) ) {                        
                        // Object.defineProperty(interfacePrototype, propertyKey, propertyDescriptor);
                        // reference(interfacePrototype, propertyKey, propertyDescriptor);
                        property(interfacePrototype, propertyKey, propertyDescriptor);
                        // log('May be error !! ' + CCClass.getInheritanceChain(interfacePrototype).some((x) => x.prototype.hasOwnProperty(propertyKey)))
                        // reference({type:js.getClassByName(classTypeName)})(interfacePrototype, propertyKey, propertyDescriptor)
                    }
                }
            }
        })
        // Object.setPrototypeOf(Interfacified, interfacePrototype)
        // js.get(Interfacified.prototype)
        // js.value(Interfacified.prototype, 'compName', compName, false, true)
        // Object.defineProperty(Interfacified.prototype, 'proScript', {
        //     value:compName,
        //     configurable: true,
        //     enumerable: false
        // })
        // const namePropertyDescriptor:PropertyDescriptor = {value:compName}
        // Object.defineProperty(interfacifiedClass.prototype, 'compName', namePropertyDescriptor);
        // property({type:CCString, readonly:true})(interfacifiedClass.prototype, 'compName', namePropertyDescriptor);
        // 
        return Interfacified as unknown as Constructor<TBase & IInterfacified>;
    }else{
        warn('If you want to use interfacify, you need extend a Referencify Injector Component');
        return null
    }    
})

