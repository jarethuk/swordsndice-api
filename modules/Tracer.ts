import { v4 as uuid } from 'uuid';
import { devLog } from '../helpers/DevTools';
import callsites from './Callsites';
import { Environment } from './Environment';

export const ErrorType = {
	Client: 'Client',
	Crypto: 'Crypto',
	Server: 'Server',
	Database: 'Database',
	Validation: 'Validation',
	Unknown: 'Unknown',
} as const;

type ErrorTypeKeys = (typeof ErrorType)[keyof typeof ErrorType];

export const LogLevel = {
	Warn: 'Warn',
	Info: 'Info',
	Error: 'Error',
} as const;

type LogLevelKeys = (typeof LogLevel)[keyof typeof LogLevel];

export class HandledError extends Error {
	constructor(
		public traceId: string,
		public type: ErrorTypeKeys,
		public moduleName: string,
		public functionName: string,
		public message: string,
		public data?: any,
	) {
		super(message);
	}
}

export interface TracerConfig {
	logLevel?: LogLevelKeys;
	module?: string;
}

/**
 * What we want from error handling:
 * 		- A trace id which links to other log messages
 * 		- To know where the error was thrown including function and file
 * 		- An easy to lookup error message
 * 		- Client friendly error message
 * 		- Small footprint when throwing the error to avoid function bloat
 */

export class Tracer {
	public traceId = uuid();

	constructor(private config: TracerConfig = { logLevel: LogLevel.Info }) {}

	private static isUI() {
		return typeof process === 'undefined';
	}

	public getClientError(message: string, data?: any): HandledError {
		return this.getError(ErrorType.Client, message, data);
	}

	public getCryptoError(message: string, data?: any): HandledError {
		return this.getError(ErrorType.Crypto, message, data);
	}

	public getServerError(message: string, data?: any): HandledError {
		return this.getError(ErrorType.Server, message, data);
	}

	public getDatabaseError(message: string, data?: any): HandledError {
		return this.getError(ErrorType.Database, message, data);
	}

	public getValidationError(message: string, data?: any): HandledError {
		return this.getError(ErrorType.Validation, message, data);
	}

	public logInfo(
		moduleName: string,
		functionName: string,
		message: any,
		data?: unknown,
	): void {
		if (this.shouldLog(LogLevel.Info)) {
			this.log(LogLevel.Info, moduleName, functionName, message, data);
		}
	}

	public logError(
		moduleName: string,
		functionName: string,
		message: any,
		data?: unknown,
	): void {
		if (this.shouldLog(LogLevel.Error)) {
			this.log(LogLevel.Error, moduleName, functionName, message, data);
		}
	}

	public logWarn(
		moduleName: string,
		functionName: string,
		message: any,
		data?: unknown,
	): void {
		if (this.shouldLog(LogLevel.Warn)) {
			this.log(LogLevel.Warn, moduleName, functionName, message, data);
		}
	}

	private getError(
		type: ErrorTypeKeys,
		originalMessage: string,
		data?: any,
	): HandledError {
		const message =
			originalMessage.charAt(0).toUpperCase() + originalMessage.slice(1);

		const trace = callsites()[1];
		const moduleName = trace.getTypeName() ?? 'Unknown';
		const functionName = trace.getMethodName() ?? 'Unknown';

		this.logError(moduleName, functionName, message, data);

		return new HandledError(
			this.traceId,
			type,
			moduleName,
			functionName,
			message,
			data,
		);
	}

	private shouldLog(level: LogLevelKeys): boolean {
		if (!Tracer.isUI() && Environment.isTest()) {
			return false;
		}

		switch (this.config.logLevel) {
			case LogLevel.Warn:
				return level === LogLevel.Warn || level === LogLevel.Error;
			case LogLevel.Error:
				return level === LogLevel.Error;
			default:
				return true;
		}
	}

	private log(
		level: LogLevelKeys,
		moduleName: string,
		functionName: string,
		message: any,
		data?: unknown,
	) {
		if (process.env.NODE_ENV === 'test') return;

		const logMessage = `(${moduleName}/${functionName}): ${message}`;

		switch (level) {
			case LogLevel.Info:
				devLog(logMessage, data);
				break;
			case LogLevel.Warn:
				console.warn(logMessage, data ?? '');
				break;
			case LogLevel.Error:
				console.error(logMessage, data ?? '');
		}
	}
}
