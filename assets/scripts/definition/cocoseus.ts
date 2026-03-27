import { cocoseus_classify } from "./cocoseus.classify";
import { cocoseus_cceditor } from "./cocoseus.cceditor";
import { cocoseus_utils } from "./cocoseus.utils";
import { cocoseus_widgets } from "./cocoseus.widgets";

// const CCEditor = cocoseus_cceditor;

export namespace cocoseus {
    export const CCClassify = cocoseus_classify.CCClassify;    
    export const utils = cocoseus_utils;
    export const CCEditor = cocoseus_cceditor;

    export const spineViewify = cocoseus_widgets.spineViewify;
    export const pipelinify = cocoseus_widgets.pipelinify;
    export const eventify = cocoseus_widgets.eventify;
    export const propertiesLoadify = cocoseus_widgets.propertiesLoadify;
    
}