/* istanbul ignore file */
import {resetDatabase} from './DevHelpers.ts';

const connectionString =
	'postgresql://postgres:postgres@localhost:5432/test_template';

(async () => {
	console.log('Setting up dev database...');

	await resetDatabase(connectionString);

	console.log('Done');
	process.exit();
})();
