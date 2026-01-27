import { GameDatastore } from '../../../datastores/GameDatastore.ts';
import { APIHelper, ValidationHelpers } from '../../../modules';
import { GameInviteResponse } from '../../../types/responses/GameInviteResponse.ts';

const router = APIHelper.getRouter({
	authenticate: true,
});

router.get(async ({ context }, response) => {
	const validation = new ValidationHelpers(context);
	const datastore = new GameDatastore(context);

	const games = await datastore.getGameInvites(context.userId);
	const results = games.map((x) => validation.validate(GameInviteResponse, x));

	response.json(results);
});

export default APIHelper.getHandler(router);
