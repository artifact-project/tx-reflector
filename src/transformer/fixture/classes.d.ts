import { IClickable } from './interfaces';
export declare class Base<T> {
    attrs: T;
    constructor(attrs: T);
}
export interface XAttrs extends IClickable {
    checked: boolean;
}
export declare class XClass extends Base<XAttrs> {
}
