export interface IClickable {
	onClick?(evt: object): void;
}

export interface IProps extends IClickable {
	value: string;
}
