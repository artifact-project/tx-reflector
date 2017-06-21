import {getInterfaces, getComponentInterfaces} from '../../reflector/reflector';
import {IProps} from './interfaces';
import {XClass} from './classes';

const forInterface = getInterfaces<IProps>({value: 'foo'});
const forComponent = getComponentInterfaces<XClass>(XClass);
