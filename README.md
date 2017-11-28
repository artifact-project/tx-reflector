TX Reflector
------------
TypeScript transformer for code generation.<br/>
See also [Interface-based instructions](https://github.com/artifact-project/ibi).


### Install

```
npm i --save-dev tx-reflector
```


### API

 - `getInterfaces(target: Function | object): string[]`
 - `getInterfaces<T>(target: T): string[]`
 - `getRawInterfaces<T>(target: T): Interface[]`
 - `getComponentInterfaces(XClass: Function): string[]`



### Usage

```ts
import {getInterfaces} from 'tx-reflector';

const data: IData = {value: 'foo'};
const interfaces: string[] = getInterfaces(data); // OR getInterfaces<IData>(anything);

// After compilation:
//   var interfaces = ["IData", "IAbstractData"];
```


### React and like

```ts
import {getComponentInterfaces} from 'tx-reflector';

interface IBtnProps extends IComponent, IClickable {
	value: string;
}

class Btn extends React.Component<IBtnProps> {
}


const interfaces = getComponentInterfaces(Btn);

// After compilation:
//   var interfaces = ["IBtnProps", "IComponent", "IClickable"];
```


### Webpack
Use [awesome-typescript-loader](https://github.com/s-panferov/awesome-typescript-loader) or [ts-loader 2.3+](https://github.com/TypeStrong/ts-loader/).

```js
// webpack.config.js
const {default:txReflector} = require('tx-reflector/src/transformer/transformer');

module.exports = {
	// ...
	module: {
		// ...
		{
			test: /\.tsx?$/,
			loader: 'awesome-typescript-loader', // or ts-loader
			options: {
				getCustomTransformers() {
					return {
						before: [txReflector],
						after: [],
					};
				}
			}
		},
	},
	// ...
};
```


### Jest (only with TS 2.4+)

```js
// .jest/tsPreprocessor.js
const tsc = require('typescript');
const tsConfig = require('../tsconfig.json');
const {default:txReflector} = require('tx-reflector/src/transformer/transformer');

module.exports = {
	process(src, path) {
		if (path.endsWith('.ts') || path.endsWith('.tsx')) {
			const result = tsc.transpileModule(src, {
				compilerOptions: tsConfig.compilerOptions,
				fileName: path,
				transformers: {
					before: [txReflector],
					after: [],
				},
			});

			return result.outputText;
		}

		return src;
	},
};
```


### Development

 - `npm i`
 - `npm test`, [code coverage](./coverage/lcov-report/index.html)

