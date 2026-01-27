/* istanbul ignore file */
import type { NextApiRequest } from 'next';
import type { Context } from './Context';

export interface EnhancedRequest extends NextApiRequest {
	context: Context;
	params?: any; // Next connect
}
