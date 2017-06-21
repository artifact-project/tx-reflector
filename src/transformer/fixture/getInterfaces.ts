import {getInterfaces} from '../../reflector/reflector';
import {IProps} from './_interfaces';

const interfaces = getInterfaces<IProps>({value: 'foo'});
