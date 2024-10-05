import { _decorator, Component, Node } from 'cc';
import { Support } from './Support';
const { ccclass, property } = _decorator;


////////////////////
// Query Settings //
////////////////////

export interface QuerySettings {
    /** What to render 'null' as in tables. Defaults to '-'. */
    renderNullAs: string;
    /** If enabled, tasks in Dataview views will automatically have their completion date appended when they are checked. */
    taskCompletionTracking: boolean;
    /** If enabled, automatic completions will use emoji shorthand ✅ YYYY-MM-DD instead of [completion:: date]. */
    taskCompletionUseEmojiShorthand: boolean;
    /** The name of the inline field to be added as a task's completion when checked. Only used if completionTracking is enabled and emojiShorthand is not. */
    taskCompletionText: string;
    /** Date format of the task's completion timestamp. Only used if completionTracking is enabled and emojiShorthand is not. */
    taskCompletionDateFormat: string;
    /** Whether or not subtasks should be recursively completed in addition to their parent task. */
    recursiveSubTaskCompletion: boolean;
    /** If true, render a modal which shows no results were returned. */
    warnOnEmptyResult: boolean;
    /** Whether or not automatic view refreshing is enabled. */
    refreshEnabled: boolean;
    /** The interval that views are refreshed, by default. */
    refreshInterval: number;
    /** The default format that dates are rendered in (using luxon's moment-like formatting). */
    defaultDateFormat: string;
    /** The default format that date-times are rendered in (using luxons moment-like formatting). */
    defaultDateTimeFormat: string;
    /** Maximum depth that objects will be expanded when being rendered recursively. */
    maxRecursiveRenderDepth: number;
    /** The name of the default ID field ('File'). */
    tableIdColumnName: string;
    /** The name of default ID fields on grouped data ('Group'). */
    tableGroupColumnName: string;
    /** Include the result count as part of the output. */
    showResultCount: boolean;
}

export const DEFAULT_QUERY_SETTINGS: QuerySettings = {
    renderNullAs: "\\-",
    taskCompletionTracking: false,
    taskCompletionUseEmojiShorthand: false,
    taskCompletionText: "completion",
    taskCompletionDateFormat: "yyyy-MM-dd",
    recursiveSubTaskCompletion: false,
    warnOnEmptyResult: true,
    refreshEnabled: true,
    refreshInterval: 2500,
    defaultDateFormat: "MMMM dd, yyyy",
    defaultDateTimeFormat: "h:mm a - MMMM dd, yyyy",
    maxRecursiveRenderDepth: 4,

    tableIdColumnName: "File",
    tableGroupColumnName: "Group",
    showResultCount: true,
};

/////////////////////
// Export Settings //
/////////////////////

export interface ExportSettings {
    /** Whether or not HTML should be used for formatting in exports. */
    allowHtml: boolean;
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
    allowHtml: true,
};

///////////////////////////////
// General Dataview Settings //
///////////////////////////////

export interface DataviewSettings extends QuerySettings, ExportSettings {
    /** The prefix for inline queries by default. */
    inlineQueryPrefix: string;
    /** The prefix for inline JS queries by default. */
    inlineJsQueryPrefix: string;
    /** If true, inline queries are also evaluated in full codeblocks. */
    inlineQueriesInCodeblocks: boolean;
    /** Enable or disable executing DataviewJS queries. */
    enableDataviewJs: boolean;
    /** Enable or disable regular inline queries. */
    enableInlineDataview: boolean;
    /** Enable or disable executing inline DataviewJS queries. */
    enableInlineDataviewJs: boolean;
    /** Enable or disable rendering inline fields prettily in Reading View. */
    prettyRenderInlineFields: boolean;
    /** Enable or disable rendering inline fields prettily in Live Preview. */
    prettyRenderInlineFieldsInLivePreview: boolean;
    /** The keyword for DataviewJS blocks. */
    dataviewJsKeyword: string;
}

/** Default settings for dataview on install. */
export const DEFAULT_SETTINGS: DataviewSettings = {
    ...DEFAULT_QUERY_SETTINGS,
    ...DEFAULT_EXPORT_SETTINGS,
    ...{
        inlineQueryPrefix: "=",
        inlineJsQueryPrefix: "$=",
        inlineQueriesInCodeblocks: true,
        enableInlineDataview: true,
        enableDataviewJs: false,
        enableInlineDataviewJs: false,
        prettyRenderInlineFields: true,
        prettyRenderInlineFieldsInLivePreview: true,
        dataviewJsKeyword: "dataviewjs",
    },
};

// ----------------------------------------

/** Shorthand for a mapping from keys to values. */
export type DataObject = { [key: string]: Literal };
/** The literal types supported by the query engine. */
export type LiteralType =
    | "boolean"
    | "number"
    | "string"
    | "date"
    | "duration"
    | "link"
    | "array"
    | "object"
    | "function"
    | "null"
    | "html"
    | "widget";
/** The raw values that a literal can take on. */
export type Literal =
    | boolean
    | number
    | string
    // | DateTime
    // | Duration
    | Link
    | Array<Literal>
    | DataObject
    | Function
    | null
    | HTMLElement
    | Widget;

/** A grouping on a type which supports recursively-nested groups. */
export type GroupElement<T> = { key: Literal; rows: Grouping<T> };
export type Grouping<T> = T[] | GroupElement<T>[];

/** Maps the string type to it's external, API-facing representation. */
export type LiteralRepr<T extends LiteralType> = T extends "boolean"
    ? boolean
    : T extends "number"
    ? number
    : T extends "string"
    ? string
    // : T extends "duration"
    // ? Duration
    // : T extends "date"
    // ? DateTime
    : T extends "null"
    ? null
    : T extends "link"
    ? Link
    : T extends "array"
    ? Array<Literal>
    : T extends "object"
    ? Record<string, Literal>
    : T extends "function"
    ? Function
    : T extends "html"
    ? HTMLElement
    : T extends "widget"
    ? Widget
    : any;

/** A wrapped literal value which can be switched on. */
export type WrappedLiteral =
    | LiteralWrapper<"string">
    | LiteralWrapper<"number">
    | LiteralWrapper<"boolean">
    | LiteralWrapper<"date">
    | LiteralWrapper<"duration">
    | LiteralWrapper<"link">
    | LiteralWrapper<"array">
    | LiteralWrapper<"object">
    | LiteralWrapper<"html">
    | LiteralWrapper<"widget">
    | LiteralWrapper<"function">
    | LiteralWrapper<"null">;

export interface LiteralWrapper<T extends LiteralType> {
    type: T;
    value: LiteralRepr<T>;
}

export namespace Values {
    /** Convert an arbitrary value into a reasonable, Markdown-friendly string if possible. */
    export function toString(
        field: any,
        setting: QuerySettings = DEFAULT_QUERY_SETTINGS,
        recursive: boolean = false
    ): string {
        let wrapped = wrapValue(field);
        if (!wrapped) return setting.renderNullAs;

        switch (wrapped.type) {
            case "null":
                return setting.renderNullAs;
            case "string":
                return wrapped.value;
            case "number":
            case "boolean":
                return "" + wrapped.value;
            case "html":
                return wrapped.value.outerHTML;
            case "widget":
                return wrapped.value.markdown();
            case "link":
                return wrapped.value.markdown();
            case "function":
                return "<function>";
            case "array":
                let result = "";
                if (recursive) result += "[";
                result += wrapped.value.map(f => toString(f, setting, true)).join(", ");
                if (recursive) result += "]";
                return result;
            case "object":
                return (
                    "{ " +  
                    Object.entries(wrapped.value)
                        .map(e => e[0] + ": " + toString(e[1], setting, true))
                        .join(", ") +
                    " }"
                );
            case "date":
                if (wrapped.value.second == 0 && wrapped.value.hour == 0 && wrapped.value.minute == 0) {
                    return wrapped.value.toFormat(setting.defaultDateFormat);
                }

                return wrapped.value.toFormat(setting.defaultDateTimeFormat);
            // case "duration":
            //     return renderMinimalDuration(wrapped.value);
        }
    }

    /** Wrap a literal value so you can switch on it easily. */
    export function wrapValue(val: Literal): WrappedLiteral | undefined {
        if (isNull(val)) return { type: "null", value: val };
        else if (isNumber(val)) return { type: "number", value: val };
        else if (isString(val)) return { type: "string", value: val };
        else if (isBoolean(val)) return { type: "boolean", value: val };
        // else if (isDuration(val)) return { type: "duration", value: val };
        // else if (isDate(val)) return { type: "date", value: val };
        else if (isWidget(val)) return { type: "widget", value: val };
        else if (isArray(val)) return { type: "array", value: val };
        else if (isLink(val)) return { type: "link", value: val };
        else if (isFunction(val)) return { type: "function", value: val };
        else if (isHtml(val)) return { type: "html", value: val };
        else if (isObject(val)) return { type: "object", value: val };
        else return undefined;
    }

    /** Recursively map complex objects at the leaves. */
    export function mapLeaves(val: Literal, func: (t: Literal) => Literal): Literal {
        if (isObject(val)) {
            let result: DataObject = {};
            for (let [key, value] of Object.entries(val)) result[key] = mapLeaves(value, func);
            return result;
        } else if (isArray(val)) {
            let result: Literal[] = [];
            for (let value of val) result.push(mapLeaves(value, func));
            return result;
        } else {
            return func(val);
        }
    }

    /** Compare two arbitrary JavaScript values. Produces a total ordering over ANY possible dataview value. */
    export function compareValue(val1: Literal, val2: Literal, linkNormalizer?: (link: string) => string): number {
        // Handle undefined/nulls first.
        if (val1 === undefined) val1 = null;
        if (val2 === undefined) val2 = null;
        if (val1 === null && val2 === null) return 0;
        else if (val1 === null) return -1;
        else if (val2 === null) return 1;

        // A non-null value now which we can wrap & compare on.
        let wrap1 = wrapValue(val1);
        let wrap2 = wrapValue(val2);

        if (wrap1 === undefined && wrap2 === undefined) return 0;
        else if (wrap1 === undefined) return -1;
        else if (wrap2 === undefined) return 1;

        // Short-circuit on different types or on reference equality.
        if (wrap1.type != wrap2.type) return wrap1.type.localeCompare(wrap2.type);
        if (wrap1.value === wrap2.value) return 0;

        switch (wrap1.type) {
            case "string":
                return wrap1.value.localeCompare(wrap2.value as string);
            case "number":
                if (wrap1.value < (wrap2.value as number)) return -1;
                else if (wrap1.value == (wrap2.value as number)) return 0;
                return 1;
            case "null":
                return 0;
            case "boolean":
                if (wrap1.value == wrap2.value) return 0;
                else return wrap1.value ? 1 : -1;
            case "link":
                let link1 = wrap1.value;
                let link2 = wrap2.value as Link;
                let normalize = linkNormalizer ?? ((x: string) => x);

                // We can't compare by file name or display, since that would break link equality. Compare by path.
                let pathCompare = normalize(link1.path).localeCompare(normalize(link2.path));
                if (pathCompare != 0) return pathCompare;

                // Then compare by type.
                let typeCompare = link1.type.localeCompare(link2.type);
                if (typeCompare != 0) return typeCompare;

                // Then compare by subpath existence.
                if (link1.subpath && !link2.subpath) return 1;
                if (!link1.subpath && link2.subpath) return -1;
                if (!link1.subpath && !link2.subpath) return 0;

                // Since both have a subpath, compare by subpath.
                return (link1.subpath ?? "").localeCompare(link2.subpath ?? "");
            // case "date":
            //     return wrap1.value < (wrap2.value as DateTime)
            //         ? -1
            //         : wrap1.value.equals(wrap2.value as DateTime)
            //         ? 0
            //         : 1;
            // case "duration":
            //     return wrap1.value < (wrap2.value as Duration)
            //         ? -1
            //         : wrap1.value.equals(wrap2.value as Duration)
            //         ? 0
            //         : 1;
            case "array":
                let f1 = wrap1.value;
                let f2 = wrap2.value as any[];
                for (let index = 0; index < Math.min(f1.length, f2.length); index++) {
                    let comp = compareValue(f1[index], f2[index]);
                    if (comp != 0) return comp;
                }
                return f1.length - f2.length;
            case "object":
                let o1 = wrap1.value;
                let o2 = wrap2.value as Record<string, any>;
                let k1 = Array.from(Object.keys(o1));
                let k2 = Array.from(Object.keys(o2));
                k1.sort();
                k2.sort();

                let keyCompare = compareValue(k1, k2);
                if (keyCompare != 0) return keyCompare;

                for (let key of k1) {
                    let comp = compareValue(o1[key], o2[key]);
                    if (comp != 0) return comp;
                }

                return 0;
            case "widget":
            case "html":
            case "function":
                return 0;
        }
    }

    /** Find the corresponding Dataveiw type for an arbitrary value. */
    export function typeOf(val: any): LiteralType | undefined {
        return wrapValue(val)?.type;
    }

    /** Determine if the given value is "truthy" (i.e., is non-null and has data in it). */
    export function isTruthy(field: Literal): boolean {
        let wrapped = wrapValue(field);
        if (!wrapped) return false;

        switch (wrapped.type) {
            case "number":
                return wrapped.value != 0;
            case "string":
                return wrapped.value.length > 0;
            case "boolean":
                return wrapped.value;
            case "link":
                return !!wrapped.value.path;
            case "date":
                return wrapped.value.toMillis() != 0;
            case "duration":
                return wrapped.value.as("seconds") != 0;
            case "object":
                return Object.keys(wrapped.value).length > 0;
            case "array":
                return wrapped.value.length > 0;
            case "null":
                return false;
            case "html":
            case "widget":
            case "function":
                return true;
        }
    }

    /** Deep copy a field. */
    export function deepCopy<T extends Literal>(field: T): T {
        if (field === null || field === undefined) return field;

        if (Values.isArray(field)) {
            return ([] as Literal[]).concat(field.map(v => deepCopy(v))) as T;
        } else if (Values.isObject(field)) {
            let result: Record<string, Literal> = {};
            for (let [key, value] of Object.entries(field)) result[key] = deepCopy(value);
            return result as T;
        } else {
            return field;
        }
    }

    export function isString(val: any): val is string {
        return typeof val == "string";
    }

    export function isNumber(val: any): val is number {
        return typeof val == "number";
    }

    // export function isDate(val: any): val is DateTime {
    //     return val instanceof DateTime;
    // }

    // export function isDuration(val: any): val is Duration {
    //     return val instanceof Duration;
    // }

    export function isNull(val: any): val is null | undefined {
        return val === null || val === undefined;
    }

    export function isArray(val: any): val is any[] {
        return Array.isArray(val);
    }

    export function isBoolean(val: any): val is boolean {
        return typeof val === "boolean";
    }

    export function isLink(val: any): val is Link {
        return val instanceof Link;
    }

    export function isWidget(val: any): val is Widget {
        return val instanceof Widget;
    }

    export function isHtml(val: any): val is HTMLElement {
        if (typeof HTMLElement !== "undefined") {
            return val instanceof HTMLElement;
        } else {
            return false;
        }
    }

    /** Checks if the given value is an object (and not any other dataview-recognized object-like type). */
    export function isObject(val: any): val is Record<string, any> {
        return (
            typeof val == "object" &&
            !isHtml(val) &&
            !isWidget(val) &&
            !isArray(val) &&
            // !isDuration(val) &&
            // !isDate(val) &&
            !isLink(val) &&
            val !== undefined &&
            !isNull(val)
        );
    }

    export function isFunction(val: any): val is Function {
        return typeof val == "function";
    }
}

///////////////
// Groupings //
///////////////

export namespace Groupings {
    /** Determines if the given group entry is a standalone value, or a grouping of sub-entries. */
    export function isElementGroup<T extends Object>(entry: T | GroupElement<T>): entry is GroupElement<T> {
        return Values.isObject(entry) && Object.keys(entry).length == 2 && "key" in entry && "rows" in entry;
    }

    /** Determines if the given array is a grouping array. */
    export function isGrouping<T>(entry: Grouping<T>): entry is GroupElement<T>[] {
        for (let element of entry) if (!isElementGroup(element)) return false;

        return true;
    }

    /** Count the total number of elements in a recursive grouping. */
    export function count<T>(elements: Grouping<T>): number {
        if (isGrouping(elements)) {
            let result = 0;
            for (let subgroup of elements) result += count(subgroup.rows);
            return result;
        } else {
            return elements.length;
        }
    }
}

//////////
// LINK //
//////////

/** The Obsidian 'link', used for uniquely describing a file, header, or block. */
export class Link {
    /** The file path this link points to. */
    public path: string;
    /** The display name associated with the link. */
    public display?: string;
    /** The block ID or header this link points to within a file, if relevant. */
    public subpath?: string;
    /** Is this link an embedded link (!)? */
    public embed: boolean;
    /** The type of this link, which determines what 'subpath' refers to, if anything. */
    public type: "file" | "header" | "block";

    /** Create a link to a specific file. */
    public static file(path: string, embed: boolean = false, display?: string) {
        return new Link({
            path,
            embed,
            display,
            subpath: undefined,
            type: "file",
        });
    }

    public static infer(linkpath: string, embed: boolean = false, display?: string) {
        if (linkpath.includes("#^")) {
            let split = linkpath.split("#^");
            return Link.block(split[0], split[1], embed, display);
        } else if (linkpath.includes("#")) {
            let split = linkpath.split("#");
            return Link.header(split[0], split[1], embed, display);
        } else return Link.file(linkpath, embed, display);
    }

    /** Create a link to a specific file and header in that file. */
    public static header(path: string, header: string, embed?: boolean, display?: string) {
        // Headers need to be normalized to alpha-numeric & with extra spacing removed.
        return new Link({
            path,
            embed,
            display,
            subpath: header,
            type: "header",
        });
    }

    /** Create a link to a specific file and block in that file. */
    public static block(path: string, blockId: string, embed?: boolean, display?: string) {
        return new Link({
            path,
            embed,
            display,
            subpath: blockId,
            type: "block",
        });
    }

    public static fromObject(object: Record<string, any>) {
        return new Link(object);
    }

    private constructor(fields: Partial<Link>) {
        Object.assign(this, fields);
    }

    /** Checks for link equality (i.e., that the links are pointing to the same exact location). */
    public equals(other: Link): boolean {
        if (other == undefined || other == null) return false;

        return this.path == other.path && this.type == other.type && this.subpath == other.subpath;
    }

    /** Convert this link to it's markdown representation. */
    public toString(): string {
        return this.markdown();
    }

    /** Convert this link to a raw object which is serialization-friendly. */
    public toObject(): Record<string, any> {
        return { path: this.path, type: this.type, subpath: this.subpath, display: this.display, embed: this.embed };
    }

    /** Update this link with a new path. */
    //@ts-ignore; error appeared after updating Obsidian to 0.15.4; it also updated other packages but didn't say which
    public withPath(path: string) {
        return new Link(Object.assign({}, this, { path }));
    }

    /** Return a new link which points to the same location but with a new display value. */
    public withDisplay(display?: string) {
        return new Link(Object.assign({}, this, { display }));
    }

    /** Convert a file link into a link to a specific header. */
    public withHeader(header: string) {
        return Link.header(this.path, header, this.embed, this.display);
    }

    /** Convert any link into a link to its file. */
    public toFile() {
        return Link.file(this.path, this.embed, this.display);
    }

    /** Convert this link into an embedded link. */
    public toEmbed(): Link {
        if (this.embed) {
            return this;
        } else {
            let link = new Link(this);
            link.embed = true;
            return link;
        }
    }

    /** Convert this link into a non-embedded link. */
    public fromEmbed(): Link {
        if (!this.embed) {
            return this;
        } else {
            let link = new Link(this);
            link.embed = false;
            return link;
        }
    }

    /** Convert this link to markdown so it can be rendered. */
    public markdown(): string {
        let result = (this.embed ? "!" : "") + "[[" + this.obsidianLink();

        if (this.display) {
            result += "|" + this.display;
        } else {
            result += "|" + Support.getFileTitle(this.path);
            if (this.type == "header" || this.type == "block") result += " > " + this.subpath;
        }

        result += "]]";
        return result;
    }

    /** Convert the inner part of the link to something that Obsidian can open / understand. */
    public obsidianLink(): string {
        const escaped = this.path.replaceAll("|", "\\|");
        if (this.type == "header") return escaped + "#" + this.subpath?.replaceAll("|", "\\|");
        if (this.type == "block") return escaped + "#^" + this.subpath?.replaceAll("|", "\\|");
        else return escaped;
    }

    /** The stripped name of the file this link points to. */
    public fileName(): string {
        return Support.getFileTitle(this.path).replace(".md", "");
    }
}

/////////////////
// WIDGET BASE //
/////////////////

/**
 * A trivial base class which just defines the '$widget' identifier type. Subtypes of
 * widget are responsible for adding whatever metadata is relevant. If you want your widget
 * to have rendering functionality (which you probably do), you should extend `RenderWidget`.
 */
export abstract class Widget {
    public constructor(public $widget: string) {}

    /**
     * Attempt to render this widget in markdown, if possible; if markdown is not possible,
     * then this will attempt to render as HTML. Note that many widgets have interactive
     * components or difficult functional components and the `markdown` function can simply
     * return a placeholder in this case (such as `<function>` or `<task-list>`).
     */
    public abstract markdown(): string;
}

/** A trivial widget which renders a (key, value) pair, and allows accessing the key and value. */
export class ListPairWidget extends Widget {
    public constructor(public key: Literal, public value: Literal) {
        super("dataview:list-pair");
    }

    public override markdown(): string {
        return `${Values.toString(this.key)}: ${Values.toString(this.value)}`;
    }
}

/** A simple widget which renders an external link. */
export class ExternalLinkWidget extends Widget {
    public constructor(public url: string, public display?: string) {
        super("dataview:external-link");
    }

    public override markdown(): string {
        return `[${this.display ?? this.url}](${this.url})`;
    }
}

export namespace Widgets {
    /** Create a list pair widget matching the given key and value. */
    export function listPair(key: Literal, value: Literal): ListPairWidget {
        return new ListPairWidget(key, value);
    }

    /** Create an external link widget which renders an external Obsidian link. */
    export function externalLink(url: string, display?: string): ExternalLinkWidget {
        return new ExternalLinkWidget(url, display);
    }

    /** Checks if the given widget is a list pair widget. */
    export function isListPair(widget: Widget): widget is ListPairWidget {
        return widget.$widget === "dataview:list-pair";
    }

    export function isExternalLink(widget: Widget): widget is ExternalLinkWidget {
        return widget.$widget === "dataview:external-link";
    }

    /** Determines if the given widget is any kind of built-in widget with special rendering handling. */
    export function isBuiltin(widget: Widget): boolean {
        return isListPair(widget) || isExternalLink(widget);
    }
}

// ----------------------------------------

/** A function which maps an array element to some value. */
export type ArrayFunc<T, O> = (elem: T, index: number, arr: T[]) => O;

/** A function which compares two types. */
export type ArrayComparator<T> = (a: T, b: T) => number;

/** Finds the value of the lowest value type in a grouping. */
export type LowestKey<T> = T extends { key: any; rows: any } ? LowestKey<T["rows"][0]> : T;

/** A ridiculous type which properly types the result of the 'groupIn' command. */
export type Ingrouped<U, T> = T extends { key: any; rows: any }
    ? { key: T["key"]; rows: Ingrouped<U, T["rows"][0]> }
    : { key: U; rows: T[] };


/**
 * Proxied interface which allows manipulating array-based data. All functions on a data array produce a NEW array
 * (i.e., the arrays are immutable).
 */
export interface IDataArray<T> {
    /** The total number of elements in the array. */
    length: number;

    /** Filter the data array down to just elements which match the given predicate. */
    where(predicate: ArrayFunc<T, boolean>): IDataArray<T>;
    /** Alias for 'where' for people who want array semantics. */
    filter(predicate: ArrayFunc<T, boolean>): IDataArray<T>;

    /** Map elements in the data array by applying a function to each. */
    map<U>(f: ArrayFunc<T, U>): IDataArray<U>;
    /** Map elements in the data array by applying a function to each, then flatten the results to produce a new array. */
    flatMap<U>(f: ArrayFunc<T, U[]>): IDataArray<U>;
    /** Mutably change each value in the array, returning the same array which you can further chain off of. */
    mutate(f: ArrayFunc<T, void>): IDataArray<T>;

    /** Limit the total number of entries in the array to the given value. */
    limit(count: number): IDataArray<T>;
    /**
     * Take a slice of the array. If `start` is undefined, it is assumed to be 0; if `end` is undefined, it is assumbed
     * to be the end of the array.
     */
    slice(start?: number, end?: number): IDataArray<T>;
    /** Concatenate the values in this data array with those of another iterable / data array / array. */
    concat(other: Iterable<T>): IDataArray<T>;

    /** Return the first index of the given (optionally starting the search) */
    indexOf(element: T, fromIndex?: number): number;
    /** Return the first element that satisfies the given predicate. */
    find(pred: ArrayFunc<T, boolean>): T | undefined;
    /** Find the index of the first element that satisfies the given predicate. Returns -1 if nothing was found. */
    findIndex(pred: ArrayFunc<T, boolean>, fromIndex?: number): number;
    /** Returns true if the array contains the given element, and false otherwise. */
    includes(element: T): boolean;

    /**
     * Return a string obtained by converting each element in the array to a string, and joining it with the
     * given separator (which defaults to ', ').
     */
    join(sep?: string): string;

    /**
     * Return a sorted array sorted by the given key; an optional comparator can be provided, which will
     * be used to compare the keys in leiu of the default dataview comparator.
     */
    sort<U>(key: ArrayFunc<T, U>, direction?: "asc" | "desc", comparator?: ArrayComparator<U>): IDataArray<T>;

    /**
     * Mutably modify the current array with an in place sort; this is less flexible than a regular sort in exchange
     * for being a little more performant. Only use this is performance is a serious consideration.
     */
    sortInPlace<U>(key: (v: T) => U, direction?: "asc" | "desc", comparator?: ArrayComparator<U>): IDataArray<T>;

    /**
     * Return an array where elements are grouped by the given key; the resulting array will have objects of the form
     * { key: <key value>, rows: DataArray }.
     */
    groupBy<U>(key: ArrayFunc<T, U>, comparator?: ArrayComparator<U>): IDataArray<{ key: U; rows: IDataArray<T> }>;

    /**
     * If the array is not grouped, groups it as `groupBy` does; otherwise, groups the elements inside each current
     * group. This allows for top-down recursive grouping which may be easier than bottom-up grouping.
     */
    groupIn<U>(key: ArrayFunc<LowestKey<T>, U>, comparator?: ArrayComparator<U>): IDataArray<Ingrouped<U, T>>;

    /**
     * Return distinct entries. If a key is provided, then rows with distinct keys are returned.
     */
    distinct<U>(key?: ArrayFunc<T, U>, comparator?: ArrayComparator<U>): IDataArray<T>;

    /** Return true if the predicate is true for all values. */
    every(f: ArrayFunc<T, boolean>): boolean;
    /** Return true if the predicate is true for at least one value. */
    some(f: ArrayFunc<T, boolean>): boolean;
    /** Return true if the predicate is FALSE for all values. */
    none(f: ArrayFunc<T, boolean>): boolean;

    /** Return the first element in the data array. Returns undefined if the array is empty. */
    first(): T;
    /** Return the last element in the data array. Returns undefined if the array is empty. */
    last(): T;

    /** Map every element in this data array to the given key, and then flatten it.*/
    to(key: string): IDataArray<any>;
    /** Map every element in this data array to the given key; unlike to(), does not flatten the result. */
    into(key: string): IDataArray<any>;

    /**
     * Recursively expand the given key, flattening a tree structure based on the key into a flat array. Useful for handling
     * heirarchical data like tasks with 'subtasks'.
     */
    expand(key: string): IDataArray<any>;

    /** Run a lambda on each element in the array. */
    forEach(f: ArrayFunc<T, void>): void;

    /** Calculate the sum of the elements in the array. */
    sum(): number;

    /** Calculate the average of the elements in the array. */
    avg(): number;

    /** Calculate the minimum of the elements in the array. */
    min(): number;

    /** Calculate the maximum of the elements in the array. */
    max(): number;

    /** Convert this to a plain javascript array. */
    array(): T[];

    /** Allow iterating directly over the array. */
    [Symbol.iterator](): Iterator<T>;

    /** Map indexes to values. */
    [index: number]: any;
    /** Automatic flattening of fields. Equivalent to implicitly calling `array.to("field")` */
    [field: string]: any;
}

/** Implementation of DataArray, minus the dynamic variable access, which is implemented via proxy. */
@ccclass('DataArray')
class DataArray<T> implements IDataArray<T> {
    private static ARRAY_FUNCTIONS: Set<string> = new Set([
        "where",
        "filter",
        "map",
        "flatMap",
        "mutate",
        "slice",
        "concat",
        "indexOf",
        "limit",
        "find",
        "findIndex",
        "includes",
        "join",
        "sort",
        "sortInPlace",
        "groupBy",
        "groupIn",
        "distinct",
        "every",
        "some",
        "none",
        "first",
        "last",
        "to",
        "into",
        "lwrap",
        "expand",
        "forEach",
        "length",
        "values",
        "array",
        "defaultComparator",
        "toString",
        "settings",
        "sum",
        "avg",
        "min",
        "max",
    ]);

    private static ARRAY_PROXY: ProxyHandler<DataArray<any>> = {
        get: function (target, prop, reciever) {
            if (typeof prop === "symbol") return (target as any)[prop];
            else if (typeof prop === "number") return target.values[prop];
            else if (prop === "constructor") return target.values.constructor;
            else if (!isNaN(parseInt(prop))) return target.values[parseInt(prop)];
            else if (DataArray.ARRAY_FUNCTIONS.has(prop.toString())) return target[prop.toString()];

            return target.to(prop);
        },
    };

    public static wrap<T>(
        arr: T[],
        settings: QuerySettings,
        defaultComparator: ArrayComparator<any> = Values.compareValue
    ): IDataArray<T> {
        return new Proxy<DataArray<T>>(
            new DataArray<T>(arr, settings, defaultComparator),
            DataArray.ARRAY_PROXY
        );
    }

    public length: number;
    [key: string]: any;

    private constructor(
        public values: any[],
        public settings: QuerySettings,
        public defaultComparator: ArrayComparator<any> = Values.compareValue
    ) {
        this.length = values.length;
    }

    private lwrap<U>(values: U[]): IDataArray<U> {
        return DataArray.wrap(values, this.settings, this.defaultComparator);
    }

    public where(predicate: ArrayFunc<T, boolean>): IDataArray<T> {
        return this.lwrap(this.values.filter(predicate));
    }

    public filter(predicate: ArrayFunc<T, boolean>): IDataArray<T> {
        return this.where(predicate);
    }

    public map<U>(f: ArrayFunc<T, U>): IDataArray<U> {
        return this.lwrap(this.values.map(f));
    }

    public flatMap<U>(f: ArrayFunc<T, U[]>): IDataArray<U> {
        let result = [];
        for (let index = 0; index < this.length; index++) {
            let value = f(this.values[index], index, this.values);
            if (!value || value.length == 0) continue;

            for (let r of value) result.push(r);
        }

        return this.lwrap(result);
    }

    public mutate(f: ArrayFunc<T, void>): IDataArray<T> {
        for (let index = 0; index < this.values.length; index++) {
            f(this.values[index], index, this.values);
        }

        return this as any;
    }

    public limit(count: number): IDataArray<T> {
        return this.lwrap(this.values.slice(0, count));
    }

    public slice(start?: number, end?: number): IDataArray<T> {
        return this.lwrap(this.values.slice(start, end));
    }

    public concat(other: IDataArray<T>): IDataArray<T> {
        return this.lwrap(this.values.concat(other.values));
    }

    /** Return the first index of the given (optionally starting the search) */
    public indexOf(element: T, fromIndex?: number): number {
        return this.findIndex(e => this.defaultComparator(e, element) == 0, fromIndex);
    }

    /** Return the first element that satisfies the given predicate. */
    public find(pred: ArrayFunc<T, boolean>): T | undefined {
        let index = this.findIndex(pred);
        if (index == -1) return undefined;
        else return this.values[index];
    }

    public findIndex(pred: ArrayFunc<T, boolean>, fromIndex?: number): number {
        for (let index = fromIndex ?? 0; index < this.length; index++) {
            if (pred(this.values[index], index, this.values)) return index;
        }

        return -1;
    }

    public includes(element: T): boolean {
        return this.indexOf(element, 0) != -1;
    }

    public join(sep?: string): string {
        return this.map(s => Values.toString(s, this.settings))
            .array()
            .join(sep ?? ", ");
    }

    public sort<U>(key?: ArrayFunc<T, U>, direction?: "asc" | "desc", comparator?: ArrayComparator<U>): IDataArray<T> {
        if (this.values.length == 0) return this;
        let realComparator = comparator ?? this.defaultComparator;
        let realKey = key ?? ((l: T) => l as any as U);

        // Associate each entry with it's index for the key function, and then do a normal sort.
        let copy = ([] as any[]).concat(this.array()).map((elem, index) => {
            return { index: index, value: elem };
        });
        copy.sort((a, b) => {
            let aKey = realKey(a.value, a.index, this.values);
            let bKey = realKey(b.value, b.index, this.values);
            return direction === "desc" ? -realComparator(aKey, bKey) : realComparator(aKey, bKey);
        });

        return this.lwrap(copy.map(e => e.value));
    }

    public sortInPlace<U>(
        key?: (value: T) => U,
        direction?: "asc" | "desc",
        comparator?: ArrayComparator<U>
    ): IDataArray<T> {
        if (this.values.length == 0) return this;
        let realComparator = comparator ?? this.defaultComparator;
        let realKey = key ?? ((l: T) => l as any as U);

        this.values.sort((a, b) => {
            let aKey = realKey(a);
            let bKey = realKey(b);

            return direction == "desc" ? -realComparator(aKey, bKey) : realComparator(aKey, bKey);
        });

        return this;
    }

    public groupBy<U>(
        key: ArrayFunc<T, U>,
        comparator?: ArrayComparator<U>
    ): IDataArray<{ key: U; rows: IDataArray<T> }> {
        if (this.values.length == 0) return this.lwrap([]);

        // JavaScript sucks and we can't make hash maps over arbitrary types (only strings/ints), so
        // we do a poor man algorithm where we SORT, followed by grouping.
        let intermediate = this.sort(key, "asc", comparator);
        comparator = comparator ?? this.defaultComparator;

        let result: { key: U; rows: IDataArray<T> }[] = [];
        let currentRow = [intermediate[0]];
        let current = key(intermediate[0], 0, intermediate.values);
        for (let index = 1; index < intermediate.length; index++) {
            let newKey = key(intermediate[index], index, intermediate.values);
            if (comparator(current, newKey) != 0) {
                result.push({ key: current, rows: this.lwrap(currentRow) });
                current = newKey;
                currentRow = [intermediate[index]];
            } else {
                currentRow.push(intermediate[index]);
            }
        }
        result.push({ key: current, rows: this.lwrap(currentRow) });

        return this.lwrap(result);
    }

    public groupIn<U>(key: ArrayFunc<LowestKey<T>, U>, comparator?: ArrayComparator<U>): IDataArray<Ingrouped<U, T>> {
        if (Groupings.isGrouping(this.values)) {
            return this.map(v => {
                return {
                    key: (v as any).key,
                    rows: DataArrayUtil.wrap((v as any).rows, this.settings).groupIn(key as any, comparator as any),
                } as any;
            });
        } else {
            return this.groupBy(key as any, comparator) as any;
        }
    }

    public distinct<U>(key?: ArrayFunc<T, U>, comparator?: ArrayComparator<U>): IDataArray<T> {
        if (this.values.length == 0) return this;
        let realKey = key ?? (x => x as any as U);

        // For similar reasons to groupBy, do a sort and take the first element of each block.
        let intermediate = this.map((x, index) => {
            return { key: realKey(x, index, this.values), value: x };
        }).sort(x => x.key, "asc", comparator);
        comparator = comparator ?? this.defaultComparator;

        let result: T[] = [intermediate[0].value];
        for (let index = 1; index < intermediate.length; index++) {
            if (comparator(intermediate[index - 1].key, intermediate[index].key) != 0) {
                result.push(intermediate[index].value);
            }
        }

        return this.lwrap(result);
    }

    public every(f: ArrayFunc<T, boolean>): boolean {
        return this.values.every(f);
    }

    public some(f: ArrayFunc<T, boolean>): boolean {
        return this.values.some(f);
    }

    public none(f: ArrayFunc<T, boolean>): boolean {
        return this.values.every((v, i, a) => !f(v, i, a));
    }

    public first(): T {
        return this.values.length > 0 ? this.values[0] : undefined;
    }
    public last(): T {
        return this.values.length > 0 ? this.values[this.values.length - 1] : undefined;
    }

    public to(key: string): IDataArray<any> {
        let result: any[] = [];
        for (let child of this.values) {
            let value = child[key];
            if (value === undefined || value === null) continue;

            if (Array.isArray(value) || DataArrayUtil.isDataArray(value)) value.forEach(v => result.push(v));
            else result.push(value);
        }

        return this.lwrap(result);
    }

    public into(key: string): IDataArray<any> {
        let result: any[] = [];
        for (let child of this.values) {
            let value = child[key];
            if (value === undefined || value === null) continue;

            result.push(value);
        }

        return this.lwrap(result);
    }

    public expand(key: string): IDataArray<any> {
        let result = [];
        let queue: any[] = ([] as any[]).concat(this.values);

        while (queue.length > 0) {
            let next = queue.pop();
            let value = next[key];

            if (value === undefined || value === null) continue;
            if (Array.isArray(value)) value.forEach(v => queue.push(v));
            else if (value instanceof DataArray) value.forEach(v => queue.push(v));
            else queue.push(value);

            result.push(next);
        }

        return this.lwrap(result);
    }

    public forEach(f: ArrayFunc<T, void>) {
        for (let index = 0; index < this.values.length; index++) {
            f(this.values[index], index, this.values);
        }
    }

    public sum() {
        return this.values.reduce((a, b) => a + b, 0);
    }

    public avg() {
        return this.sum() / this.values.length;
    }

    public min() {
        return Math.min(...this.values);
    }

    public max() {
        return Math.max(...this.values);
    }

    public array(): T[] {
        return ([] as any[]).concat(this.values);
    }

    public [Symbol.iterator](): Iterator<T> {
        return this.values[Symbol.iterator]();
    }

    public toString(): string {
        return "[" + this.values.join(", ") + "]";
    }
}

/** Provides utility functions for generating data arrays. */
export namespace DataArrayUtil {
    /** Create a new Dataview data array. */
    export function wrap<T>(raw: T[] | IDataArray<T>, settings: QuerySettings): IDataArray<T> {
        if (isDataArray(raw)) return raw;
        return DataArray.wrap(raw, settings);
    }

    /** Create a new DataArray from an iterable object. */
    export function from<T>(raw: Iterable<T>, settings: QuerySettings): IDataArray<T> {
        if (isDataArray(raw)) return raw;

        let data = [];
        for (let elem of raw) data.push(elem);
        return DataArray.wrap(data, settings);
    }

    /** Return true if the given object is a data array. */
    export function isDataArray(obj: any): obj is IDataArray<any> {
        return obj instanceof DataArray;
    }
}

// A scary looking polyfill, sure, but it fixes up data array/array interop for us.
const oldArrayIsArray = Array.isArray;
Array.isArray = (arg): arg is any[] => {
    return oldArrayIsArray(arg) || DataArrayUtil.isDataArray(arg);
};

