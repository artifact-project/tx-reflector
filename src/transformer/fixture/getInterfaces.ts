import {getInterfaces} from '../../reflector/reflector';
import {IProps} from './_interfaces';

const props: IProps = {value: 'foo'}
const interfaces = getInterfaces(props);
const interfacesWithT = getInterfaces<IProps>({value: 'bar'});
