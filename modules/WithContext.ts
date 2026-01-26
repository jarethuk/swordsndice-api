/* istanbul ignore file */
import type { Context } from './Context';
import type { HandledError } from './Tracer';

export class WithContext {
	protected context: Context;

	constructor(context: Context) {
		this.context = context;
	}

	public getContext(): Context {
		return this.context;
	}

	// Shorthand error functions
	public getClientError(message: string, data?: any): HandledError {
		return this.context.tracer.getClientError(message, data);
	}

	public getCryptoError(message: string, data?: any): HandledError {
		return this.context.tracer.getCryptoError(message, data);
	}

	public getServerError(message: string, data?: any): HandledError {
		return this.context.tracer.getServerError(message, data);
	}

	public getDatabaseError(message: string, data?: any): HandledError {
		return this.context.tracer.getDatabaseError(message, data);
	}

	public getValidationError(message: string, data?: any): HandledError {
		return this.context.tracer.getValidationError(message, data);
	}
}
