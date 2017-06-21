import * as ts from 'typescript';

const R_TS_REFLECTOR = /(tx-reflector|\.\.\/reflector\/reflector['"])$/;

function hasStatements(node: ts.Node): node is ts.Block {
	return node.hasOwnProperty('statements');
}

function getFromImportClause(importClause: ts.ImportClause, name: string) {
	const {namedBindings} = importClause;
	let exportName = null;

	if (importClause.name) {
		exportName = importClause.name.getText() === name ? 'default' : null;
	} else if ((<ts.NamedImports>namedBindings).elements) {

		(<ts.NamedImports>namedBindings).elements.some(node => {
			if (node.name.getText() === name) {
				exportName = node.propertyName ? node.propertyName.getText() : name;
				return true;
			}
		});
	}

	return exportName;
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
		const type = typeChecker.getTypeFromTypeNode(targetNode);

		return {
			type,
			typeChecker,
		};
	}

	return null;
}

function getInterfacesList({type, typeChecker}: TypeOfNode) {
	const list = {};
	const properties = typeChecker.getPropertiesOfType(type);

	properties.forEach((prop) => {
		const name = (prop as object as {parent: {name: string}}).parent.name;
		list[name] = true;
	});

	return Object.keys(list);
}

function log(obj) {
	const copy = Object.assign({}, obj);
	delete copy.parent;
	console.log(copy);
}

function visitNode(node: ts.Node, reflect) {
	if (isCallExpression(node)) {
		const method = node.expression.getText();

		if (reflect.methods.includes(method)) {
			let list = [];

			if (method === 'getInterfaces') {
				const result = getTypeFromTypeNode(reflect.fileName, node.typeArguments[0]);

				if (result) {
					list = getInterfacesList(result);
				}
			} else if (method === 'getComponentInterfaces') {
				const {type, typeChecker} = getTypeFromTypeNode(reflect.fileName, node.typeArguments[0]);
				const classLike = type.symbol.valueDeclaration as ts.ClassLikeDeclaration;

				classLike.heritageClauses.forEach(node => {
					node.types.forEach(type => {
						type.typeArguments.forEach(arg => {
							const result = typeChecker.getTypeFromTypeNode(arg);
							list.push.apply(list, getInterfacesList({type: result, typeChecker}));
						});
					});
				});
			}

			return ts.createArrayLiteral(list.map(name => ts.createLiteral(name)));
		}
	}

	return node;
}

function visitNodeAndChildren(node: ts.Node, context, reflect) {
	return ts.visitEachChild(
		visitNode(node, reflect),
		(childNode) => visitNodeAndChildren(childNode, context, reflect),
		context
	);
}

function transformer(context) {
	return function visitor(file: ts.SourceFile) {
		const reflect = {
			fileName: file.fileName,
			methods: [],
		};
		const hasImport = file.statements.some((node) => {
			if (isImportDeclaration(node)) {
				if (R_TS_REFLECTOR.test(node.moduleSpecifier.getText())) {
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
