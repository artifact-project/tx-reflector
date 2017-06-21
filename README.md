TX Reflector
------------
TypeScript transformer for code generation.

 - `npm i --save-dev ts-reflector`


### API

 - `getInterfaces<T>(target: T): string[]`
 - `getComponentInterfaces(XClass: Function): string[]`



### Usage

```ts
import {getInterfaces} from 'ts-reflector';

const interfaces: string[] = getInterfaces<IData>(data);

// After compilation:
//   var interfaces = ["IData", "IAbstractData"];
```


### React and like

```ts
import {getComponentInterfaces} from 'ts-reflector';

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
Use [awesome-typescript-loader](https://github.com/s-panferov/awesome-typescript-loader) or (ts-loader)[https://github.com/TypeStrong/ts-loader/pull/535].

```js
// webpack.config.js
const {default:txReflector} = require('tx-reflector/src/transformer');

module.exports = {
	// ...
	module: {
		// ...
		{
			test: /\.tsx?$/,
			loader: 'awesome-typescript-loader',
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


### Development

 - `npm i`
 - `npm test`


### Code coverage

 - [coverage/lcov-report/index.html](./coverage/lcov-report/index.html)
