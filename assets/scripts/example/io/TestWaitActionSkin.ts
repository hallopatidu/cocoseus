import { _decorator, Asset, Component, js, log, Node } from 'cc';
// import { TestReferencify } from '../TestReferencify';
// import Interfacify from '../../cocoseus/core/Interfacify';
// import { TestWaitAction } from '../TestWaitAction';
import Referencify, { reference } from '../../cocoseus/core/Referencify';
import Parasitify, { override, OverrideMethodNameMap } from '../../cocoseus/core/Parasitify';
import { TestReferencify } from '../TestReferencify';
import Decoratify from '../../cocoseus/core/Decoratify';

const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('TestWaitActionSkin')
@executeInEditMode(true)
export class TestWaitActionSkin extends Parasitify(Component) {
    

    // protected onLoad(): void {
    //     // //
    //     if(!this.super) return;
    //     const propertyNames:string[] = Array.from( Decoratify(this.super).keys('@reference'));
    //     propertyNames.forEach((propName:string)=>{
    //         const propArr:string[] = propName?.split("::");
    //         if(propArr && propArr.length){                    
    //             // const propertyName:string = propArr[0];
    //             // const classTypeName:string = propArr[1];


    //             // const superPropDescriptor:PropertyDescriptor = js.getPropertyDescriptor(this.super.constructor, propName);
    //             // superPropDescriptor.configurable = true;
    //             // const classA = Referencify(Component)
    //             // reference({type:js.getClassByName(Asset)})(classA.prototype, propName, superPropDescriptor)
    //             // this.node.addComponent(classA)
    //         }
    //     })
    //     log('ok on load !!!' + propertyNames)
        

    //     // if(!this.super['isProgressing']()) this.super['onLoad']()
    //     // const classComp:any = js.getClassByName('Abc') || ccclass('Abc')(Referencify(Component));

    //     // log('Has component ' + !!this.node.getComponent(Referencify(Component)));
    //     // const comp:Component =  this.node.getComponent(classComp) || this.node.addComponent(classComp);
    //     // // this.node.addComponent(Referencify(Component))
        
    // }

    public get internalOnLoad (): (() => void) | undefined {
        
        // const propertyNames:string[] = Array.from( Decoratify(this.super).keys('@reference'));
        this[OverrideMethodNameMap]
        // log('Parasiiiiiiiiiiiiiii  ' + propertyNames)
        // js.getset()
        return super['internalOnLoad']
    }

    // @override
    // async startLoadingAssets(){
    //     log('start loading all property')
    //     await this.super['startLoadingAssets']()
    // }

}


