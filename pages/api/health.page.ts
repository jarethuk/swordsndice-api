import { APIHelper } from '../../modules/APIHelper';

const router = APIHelper.getRouter();
export const healthSecret = 'somethingsecret'; // Just to prevent spam on the db

router.get(async ({ context, url }, response) => {
	const query = url?.split('?secret=') ?? [];

	if (query.length !== 2 || query[1] !== healthSecret) {
		response.status(404).send('Not found');
		return;
	}

	try {
		await context.database.$executeRawUnsafe('SELECT now()');
	} catch (e) {
		/* istanbul ignore next */
		throw context.tracer.getClientError('Database connection failed', { e });
	}

	response.json('All good');
});

export default APIHelper.getHandler(router);
