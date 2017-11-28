export type Interface = {
	name: string;
	entries: {
		name: string;
		type: string;
		optional: boolean;
	}[];
};

export function getInterfaces<T>(target: T | Function | object): string[] {
	return [];
}

export function getRawInterfaces<T>(target: T | Function | object): Interface[] {
	return [];
}

export function getComponentInterfaces(target: Function | object): string[] {
	return [];
}
