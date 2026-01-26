/* istanbul ignore file */
import {Context} from '../modules/Context';
import {Tracer} from '../modules/Tracer';

export const getEmptyContext = () => {
	return new Context({
		tracer: new Tracer({}),
	} as any);
};