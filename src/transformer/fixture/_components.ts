import {IClickable, IProps} from './_interfaces';

export interface Stateless<T> {
  (props: T);
}

export namespace Creact {
	export interface Stateless<T> {
	  (props: T);
	}
}

export function createCmp<T>(): Stateless<T> {
	return function (props: T) {}
}

export function createCmp2<T>(): Creact.Stateless<T> {
	return function (props: T) {}
}

export class Base<T> {
	constructor(public attrs: T) {
	}
}

export interface XAttrs extends IClickable {
	checked: boolean;
}

export class XCmp extends Base<XAttrs> {
}

export const XPureCmp = (props: XAttrs) => {
};

export const XPureCmpWithSpred = ({checked}: XAttrs) => {
};

export function XFnPureCmp(props: XAttrs) {
}

export const XLikeFnCmp = createCmp<IProps>();
export const XLikeFnCmp2 = createCmp2<IProps>();
