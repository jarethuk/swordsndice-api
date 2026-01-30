/* istanbul ignore file */
import 'reflect-metadata';
import {Expose, Type} from 'class-transformer';
import {transformAndValidateSync} from 'class-transformer-validator';
import {IsNotEmpty, IsOptional, IsString, ValidateNested,} from 'class-validator'; // class DatabaseEnv {

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

class GoogleEnv {
	@IsString()
	@IsOptional()
	@Expose()
	webClientId?: string;

	@IsString()
	@IsOptional()
	@Expose()
	webSecret?: string;

	@IsString()
	@IsOptional()
	@Expose()
	webRedirectUrl?: string;

	@IsString()
	@IsOptional()
	@Expose()
	iosClientId?: string;
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

	@ValidateNested()
	@Type(() => GoogleEnv)
	@Expose()
	public google!: GoogleEnv;
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
		database: {
			nonPoolingUrl: getOrError('POSTGRES_URL_NON_POOLING'),
			poolingUrl: getOrError('POSTGRES_PRISMA_URL'),
		},
		email: {
			user: process.env.EMAIL_USER,
			password: process.env.EMAIL_PASSWORD,
		},
		google: {
			webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
			webSecret: process.env.GOOGLE_WEB_SECRET,
			iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
			webRedirectUrl: process.env.GOOGLE_WEB_REDIRECT_URL,
		},
	} as EnvDefinition;

	return transformAndValidateSync(EnvDefinition, env, {
		transformer: {
			excludeExtraneousValues: true,
			exposeUnsetFields: false,
		},
	});
};
