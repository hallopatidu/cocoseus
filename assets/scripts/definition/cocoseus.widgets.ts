import Pipelineify from "../plugins/Pipelinify";
import EventHandlerClass from "../plugins/EventHandlerClassify";
import { cocoseus_cceditor } from "./cocoseus.cceditor";
import SpineViewify from "../plugins/SpineViewify";
import PropertyLoadify from "../plugins/PropertyLoadify";


export namespace cocoseus_widgets {   
    export const eventify:(() => ClassDecorator) & ClassDecorator = cocoseus_cceditor.makeSmartClassDecorator<string>((constructor) => EventHandlerClass(constructor));
    export const spineViewify:(() => ClassDecorator) & ClassDecorator = cocoseus_cceditor.makeSmartClassDecorator<string>((constructor) => SpineViewify(constructor));
    export const pipelinify:(() => ClassDecorator) & ClassDecorator = cocoseus_cceditor.makeSmartClassDecorator<string>((constructor) => Pipelineify(constructor));
    export const propertiesLoadify:(() => ClassDecorator) & ClassDecorator = cocoseus_cceditor.makeSmartClassDecorator<string>((constructor) => PropertyLoadify(constructor));
    
}