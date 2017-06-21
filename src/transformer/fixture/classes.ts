import {IClickable} from './interfaces';

export class Base<T> {
	constructor(public attrs: T) {
	}
}

export interface XAttrs extends IClickable {
	checked: boolean;
}

export class XClass extends Base<XAttrs> {
}
