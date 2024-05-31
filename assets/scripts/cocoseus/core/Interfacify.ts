import { _decorator, Component, Constructor, log, Node } from 'cc';
import { IInterfacified, IStaticDecoratified, IStaticInterfacified } from '../types/CoreType';
import { getInjector, hadInjectorImplemented, Inheritancify } from './Inheritancify';
import Referencify, { reference } from './Referencify';
import Decoratify from './Decoratify';
const { ccclass, property } = _decorator;

/**
 * 
 */
export default Inheritancify<IInterfacified, IStaticInterfacified>(function Interfacify <TBase>(base:Constructor<TBase>):Constructor<TBase & IInterfacified>{
    class Interfacified extends Component implements IInterfacified {

        // /**
        //  * 
        //  */
        // public get internalOnLoad (): (() => void) | undefined {
        //     return super['internalOnLoad']
        // }

        // /**
        //  * 
        //  */
        // public get internalOnStart (): (() => void) | undefined {
        //     return super['internalOnStart']
        // }
        
    }
    //     
    if(hadInjectorImplemented(base, 'Referencify')){
        const propertyKeys:string[] = (getInjector('Decoratify', base) as IStaticDecoratified).keys('@reference');
        const callbacksInvokerPrototype = base.prototype;
        const interfacifiedClass:Constructor = Referencify(Interfacified as unknown as Constructor<Component>);

        for (let iPropertyKey = 0; iPropertyKey < propertyKeys.length; ++iPropertyKey) {
            const propertyKey = propertyKeys[iPropertyKey];
            if (!(propertyKey in interfacifiedClass.prototype)) {
                const propertyDescriptor = Object.getOwnPropertyDescriptor(callbacksInvokerPrototype, propertyKey);
                if (propertyDescriptor && 
                    ((propertyDescriptor.value && typeof propertyDescriptor.value !== 'function') || propertyDescriptor.get || propertyDescriptor.set)
                ) {
                    //
                    Object.defineProperty(interfacifiedClass.prototype, propertyKey, propertyDescriptor);
                    reference(interfacifiedClass.prototype, propertyKey, propertyDescriptor)
                }
            }
        }
        return interfacifiedClass as unknown as Constructor<TBase & IInterfacified>;
    }
    return Interfacified as unknown as Constructor<TBase & IInterfacified>;
})

