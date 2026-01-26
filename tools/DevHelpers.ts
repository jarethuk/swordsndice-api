/* istanbul ignore file */
import {exec} from 'node:child_process';
import pg from 'pg';

export const runCommand = (command: string) => {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout) => {
			if (error) {
				// eslint-disable-next-line no-console
				console.log(error);
				reject(error);
			} else {
				resolve(stdout);
			}
		});
	});
};

export const resetDatabase = async (connectionString: string) => {
	const client = new pg.Client({
		connectionString,
	});

	await client.connect();

	console.log('Removing schema...');
	await client.query('DROP SCHEMA IF EXISTS public CASCADE');
	await client.end();

	console.log('Migrating database...');
	await runCommand(
		`cross-env POSTGRES_URL_NON_POOLING=${connectionString} POSTGRES_PRISMA_URL=${connectionString} npm run db:deploy`,
	);
};
