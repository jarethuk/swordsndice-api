/* istanbul ignore file */
import { exec } from 'node:child_process';
import type { PrismaClient } from '@prisma/client';
import { Client } from 'pg';
import { Cache } from '../modules/Cache';
import { Context } from '../modules/Context';
import { Database } from '../modules/Database';
import { Tracer } from '../modules/Tracer';
import { Env } from '../types/EnvDefinition';
import { devLog } from './DevTools';

export class TestFramework {
	public static TestPassword = 'Welcome123!';
	public readonly tracer: Tracer;
	public database!: PrismaClient;
	private readonly baseDatabaseUrl =
		'postgresql://postgres:postgres@localhost:5432/';
	private db?: Database;
	private templateDatabaseName = 'test_template';

	constructor() {
		this.tracer = new Tracer();
	}

	public async end() {
		await this.db?.disconnect();
		await Cache.end();
	}

	public async dbExists(name: string): Promise<boolean> {
		const databases = (await this.executeDBCommand(
			`SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower('${name}');`,
		)) as {
			rows: [];
		};

		return !!databases.rows.length;
	}

	public async migrateDatabase(name: string, override?: string) {
		const connectionString = override ?? this.baseDatabaseUrl + name;

		await this.runCommand(
			`cross-env POSTGRES_URL_NON_POOLING=${connectionString} POSTGRES_PRISMA_URL=${connectionString} npm run db:deploy`,
		);
	}

	public async createDatabase(name: string) {
		await this.executeDBCommand(`CREATE DATABASE ${name}`);
		await this.migrateDatabase(name);
	}

	public async executeDBCommand<T>(
		command: string,
		dbName?: string,
	): Promise<T> {
		const client = await this.getPGClient(dbName);
		const result = await client.query(command);

		await client.end();
		return result as T;
	}

	public async setupTestDatabase() {
		if (await this.dbExists(this.templateDatabaseName)) {
			await this.executeDBCommand(`DROP DATABASE ${this.templateDatabaseName}`);
		}

		await this.createDatabase(this.templateDatabaseName);
	}

	public async setDatabase(
		name: string,
		_connectionString?: string,
	): Promise<Context> {
		let connectionString = _connectionString;

		if (!connectionString) {
			connectionString = this.baseDatabaseUrl + name;
		}

		this.db = new Database(connectionString);

		this.database = await this.db.connect();

		return this.getTestContext();
	}

	public async initialise(
		_name: string,
		_connectionString?: string,
	): Promise<Context> {
		let connectionString = _connectionString;
		const name = _name.replace(/[^a-zA-Z]/g, '_').toLowerCase();

		if (!connectionString) {
			connectionString = this.baseDatabaseUrl + name;
		}

		await this.executeDBCommand(`DROP DATABASE IF EXISTS ${name}`);
		await this.createFromTestTemplate(name);

		return this.setDatabase(name, connectionString);
	}

	public objectMatchesReadableSnapshot(object: any) {
		expect(JSON.stringify(object, undefined, 4)).toMatchSnapshot();
	}

	public getTestContext(config?: {
		userId?: string;
		withEscalatedPrivileges?: boolean;
	}): Context {
		const env = Env();

		return new Context({
			database: this.database,
			tracer: this.tracer,
			userId: config?.userId,
			env,
		});
	}

	public async runCommand(command: string) {
		return new Promise((resolve, reject) => {
			exec(command, (error, stdout) => {
				if (error) {
					// eslint-disable-next-line no-console
					devLog(error);
					reject(error);
				} else {
					resolve(stdout);
				}
			});
		});
	}

	private async createFromTestTemplate(name: string) {
		const client = await this.getPGClient();
		await client.query(
			`CREATE database ${name} WITH TEMPLATE ${this.templateDatabaseName}`,
		);
		await client.end();
	}

	private async getPGClient(dbName?: string): Promise<Client> {
		const connectionString = this.baseDatabaseUrl + (dbName ?? 'postgres');
		const client = new Client(connectionString);
		await client.connect();

		return client;
	}
}
