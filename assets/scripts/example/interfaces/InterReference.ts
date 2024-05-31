import { _decorator, Component, Node } from 'cc';
import { TestReferencify } from '../TestReferencify';
import Interfacify from '../../cocoseus/core/Interfacify';
const { ccclass, property } = _decorator;

@ccclass('InterReference')
export class InterReference extends Interfacify(TestReferencify) {
    
}


