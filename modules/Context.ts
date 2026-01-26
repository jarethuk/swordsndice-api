/* istanbul ignore file */
import type {PrismaClient} from '@prisma/client';
import type {EnvDefinition} from '../types/EnvDefinition';
import type {Tracer} from './Tracer';

export interface ContextConfig {
	tracer: Tracer;
	env: EnvDefinition;
	userId?: string;
	database: PrismaClient;
}

export class Context {
	public readonly tracer: Tracer;
	public readonly env: EnvDefinition;
	public readonly userId: string;
	public readonly database: PrismaClient;

	constructor(config: ContextConfig) {
		this.tracer = config.tracer;
		this.env = config.env;
		this.userId = config.userId ?? '';
		this.database = config.database;
	}
}
