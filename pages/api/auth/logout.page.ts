/* istanbul ignore file */
import { getIronSession } from 'iron-session';
import { APIHelper, type SessionData, ironOptions } from '../../../modules';

const router = APIHelper.getRouter();

router.get(async (request, response) => {
	const session = await getIronSession<SessionData>(
		request,
		response,
		ironOptions,
	);

	session.destroy();

	response.json(true);
});

export default APIHelper.getHandler(router);
