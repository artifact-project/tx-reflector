import {getRawInterfaces} from '../../reflector/reflector';
import {IProps} from './_interfaces';

const props: IProps = {value: 'foo'};
const interfaces = getRawInterfaces(props);
const interfacesWithT = getRawInterfaces<IProps>({value: 'bar'});
