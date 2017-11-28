import * as ts from 'typescript';

const R_TS_REFLECTOR = /^(['"]?)(tx-reflector|\.\.\/\.\.\/reflector\/reflector)\1$/;

const KIND_TO_TYPE = Object.keys(ts.SyntaxKind).reduce((types, name) => {
	types[ts.SyntaxKind[name]] = name.toLowerCase().replace(/(keyword)$/, '');
	return types;
}, {});

interface IReflectTarget {
	fileName: string;
	methods: string[];
}

function hasTypeArguments(node): node is ts.TypeReference {
	return node.hasOwnProperty('typeArguments');
}

function isClassDeclaration(node): node is ts.ClassDeclaration {
	return node.kind === ts.SyntaxKind.ClassDeclaration;
}

function isFunctionLikeDeclaration(node): node is ts.FunctionDeclaration {
	return (
		node.kind === ts.SyntaxKind.ArrowFunction ||
		node.kind === ts.SyntaxKind.FunctionDeclaration
	);
}

function isImportDeclaration(node): node is ts.ImportDeclaration {
	return node.kind === ts.SyntaxKind.ImportDeclaration;
}

function isCallExpression(node): node is ts.CallExpression {
	return node.kind === ts.SyntaxKind.CallExpression;
}

type TypeOfNode = {type: ts.Type, typeChecker: ts.TypeChecker};

function getTypeFromTypeNode(fileName, searchNode: ts.Node): TypeOfNode | null {
	const program = ts.createProgram([fileName], {
		noEmitOnError: true,
		jsx: ts.JsxEmit.React,
		target: ts.ScriptTarget.ES5
	});

	const typeChecker = program.getTypeChecker();
	const sourceFile = program.getSourceFiles().find(node => node.fileName === fileName);
	let targetNode;

	ts.forEachChild(sourceFile, function next(node) {
		if (node.kind === searchNode.kind && node.pos === searchNode.pos) {
			targetNode = node;
			return;
		}

		!targetNode && ts.forEachChild(node, next);
	});

	if (targetNode) {
		return {
			type: typeChecker.getTypeAtLocation(targetNode),
			typeChecker,
		};
	}

	return null;
}

function getInterfacesList({type, typeChecker}: TypeOfNode, raw: boolean = false) {
	const properties = typeChecker.getPropertiesOfType(type);

	if (raw) {
		const exists = {};
		const list = [];

		properties.forEach((prop) => {
			const name = (prop as object as { parent: { name: string } }).parent.name;

			if (!exists.hasOwnProperty(name)) {
				list.push(exists[name] = {
					name,
					entries: [],
				});
			}

			exists[name].entries.push({
				name: prop.name,
				type: KIND_TO_TYPE[(prop.valueDeclaration as any).type.kind],
				optional: !!(prop.flags & ts.SymbolFlags.Optional),
			});
		});

		return list;
	} else {
		const list = {};

		properties.forEach((prop) => {
			const name = (prop as object as { parent: { name: string } }).parent.name;
			list[name] = true;
		});

		return Object.keys(list);
	}
}

function log(obj) {
	const copy = {...obj};
	delete copy.parent;
	console.log(copy);
}

function visitNode(node: ts.Node, reflect: IReflectTarget): ts.Node {
	if (isCallExpression(node)) {
		const method = node.expression.getText();

		if (reflect.methods.includes(method)) {
			let list = [];

			if (!(node.arguments || node.typeArguments)) {
				return node;
			}

			if (method === 'getInterfaces' || method === 'getRawInterfaces') {
				// Interfaces
				const target = node.typeArguments ? node.typeArguments[0] : node.arguments[0];
				const result = getTypeFromTypeNode(reflect.fileName, target);

				if (result) {
					list = getInterfacesList(result, method === 'getRawInterfaces');
				}
			} else if (method === 'getComponentInterfaces' && node.arguments.length) {
				// React and like
				const {type, typeChecker} = getTypeFromTypeNode(reflect.fileName, node.arguments[0]);

				if (type && type.symbol) {
					const {valueDeclaration} = type.symbol;

					if (!valueDeclaration) {
						if (hasTypeArguments(type)) {
							// const cmp = fnName<X>();
							list = getInterfacesList({type: type.typeArguments[0], typeChecker});
						}
					} else if (isClassDeclaration(valueDeclaration)) {
						// class Btn extends Base<X>
						valueDeclaration.heritageClauses.forEach(node => {
							node.types.forEach(type => {
								type.typeArguments.forEach(arg => {
									const result = typeChecker.getTypeFromTypeNode(arg);
									list.push.apply(list, getInterfacesList({type: result, typeChecker}));
								});
							});
						});
					} else if (isFunctionLikeDeclaration(valueDeclaration) && valueDeclaration.parameters.length) {
						// const cmp = (props: X) => {};
						const result = typeChecker.getTypeFromTypeNode(valueDeclaration.parameters[0].type);
						list = getInterfacesList({type: result, typeChecker});
					}
				}
			}

			return ts.createArrayLiteral(list.map(name => {
				if (typeof name === 'string') {
					return ts.createLiteral(name)
				} else {
					return ts.createIdentifier(JSON.stringify(name));
				}
			}));
		}
	}

	return node;
}

function visitNodeAndChildren(node: ts.Node, context, reflect: IReflectTarget) {
	return ts.visitEachChild(
		visitNode(node, reflect),
		(childNode) => visitNodeAndChildren(childNode, context, reflect),
		context
	);
}

function transformer(context) {
	return function visitor(file: ts.SourceFile) {
		const reflect: IReflectTarget = {
			fileName: file.fileName,
			methods: [],
		};
		const hasImport = file.statements.some((node) => {
			if (isImportDeclaration(node)) {
				if (R_TS_REFLECTOR.test(node.moduleSpecifier['text'])) {
					const bindings = (node.importClause.namedBindings as ts.NamedImports);
					reflect.methods = bindings.elements.map(({name}) => name.getText());
					return true;
				}
			}

			return false;
		});

		return hasImport ? visitNodeAndChildren(file, context, reflect) : file;
	}
}

export default transformer;
