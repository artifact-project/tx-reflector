import {readFileSync} from 'fs';
import * as ts from 'typescript';
import transformerFactory from './transformer';

const compilerOptions = {
	module: ts.ModuleKind.CommonJS,
	target: ts.ScriptTarget.ES5,
};

const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
	removeComments: false,
});

function transform(name: string): string {
	const fileName = `${__dirname}/fixture/${name}.ts`;
	const sourceFile = ts.createSourceFile(fileName, readFileSync(fileName) + '', ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
	const transformationResult = ts.transform(sourceFile, [transformerFactory], compilerOptions);

	return printer.printFile(transformationResult.transformed[0]);
}

it('getInterfaces', () => {
	expect(transform(`getInterfaces`)).toMatchSnapshot();
});

it('getRawInterfaces', () => {
	expect(transform(`getRawInterfaces`)).toMatchSnapshot();
});

describe('getComponentInterfaces', () => {
	it('XCmp', () => {
		expect(transform(`getComponentInterfaces.XCmp`)).toMatchSnapshot();
	});

	it('XPureCmp', () => {
		expect(transform(`getComponentInterfaces.XPureCmp`)).toMatchSnapshot();
	});

	it('XPureCmpWithSpred', () => {
		expect(transform(`getComponentInterfaces.XPureCmpWithSpred`)).toMatchSnapshot();
	});

	it('XPureCmpWithSpred', () => {
		expect(transform(`getComponentInterfaces.XPureCmpWithSpred`)).toMatchSnapshot();
	});

	it('XFnPureCmp', () => {
		expect(transform(`getComponentInterfaces.XFnPureCmp`)).toMatchSnapshot();
	});

	it('XLikeFnCmp', () => {
		expect(transform(`getComponentInterfaces.XLikeFnCmp`)).toMatchSnapshot();
	});

	it('React', () => {
		expect(transform(`getComponentInterfaces.React`)).toMatchSnapshot();
	});
});
