/* istanbul ignore file */
import 'reflect-metadata';
import {Expose, Type} from 'class-transformer';
import {transformAndValidateSync} from 'class-transformer-validator';
import {IsNotEmpty, IsOptional, IsString, ValidateNested} from 'class-validator'; // class DatabaseEnv {

class DatabaseEnv {
	@IsString()
	@IsNotEmpty()
	@Expose()
	poolingUrl!: string;

	@IsString()
	@IsNotEmpty()
	@Expose()
	nonPoolingUrl!: string;
}

class EmailEnv {
	@IsString()
	@IsOptional()
	@Expose()
	user?: string;

	@IsString()
	@IsOptional()
	@Expose()
	password?: string;
}

export class EnvDefinition {
	@IsString()
	@Expose()
	public sessionKey?: string;

	@ValidateNested()
	@Type(() => DatabaseEnv)
	@Expose()
	public database!: DatabaseEnv;

	@ValidateNested()
	@Type(() => EmailEnv)
	@Expose()
	public email!: EmailEnv;
}

const getOrError = (key: string): string => {
	const value = process.env[key];

	if (!value) {
		throw new Error(`Env missing: ${key}`);
	}

	return value;
};

export const Env = () => {
	const env = {
		sessionKey: getOrError('SESSION_KEY'),
		redis: getOrError('REDIS_URL'),
		database: {
			nonPoolingUrl: getOrError('POSTGRES_URL_NON_POOLING'),
			poolingUrl: getOrError('POSTGRES_PRISMA_URL'),
		},
		email: {
			user: process.env.EMAIL_USER,
			password: process.env.EMAIL_PASSWORD,
		},
	} as EnvDefinition;

	return transformAndValidateSync(EnvDefinition, env, {
		transformer: {
			excludeExtraneousValues: true,
			exposeUnsetFields: false,
		},
	});
};
