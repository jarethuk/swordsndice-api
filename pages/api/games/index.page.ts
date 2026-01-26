import {IsEnum, IsOptional} from 'class-validator';
import {GameDatastore} from '../../../datastores/GameDatastore.ts';
import {APIHelper, ValidationHelpers} from '../../../modules';
import {CreateGameRequest} from '../../../types/requests/CreateGameRequest.ts';
import {GameListResponse} from '../../../types/responses/GameListResponse.ts';
import {IdResponse} from '../../../types/responses/IdResponse.ts';
import {Expose} from 'class-transformer';

const router = APIHelper.getRouter({
	authenticate: true,
});

class Query {
	@IsEnum(['active', 'complete'])
	@IsOptional()
	@Expose()
	public state?: 'active' | 'complete';
}

router.get(async ({ context, query }, response) => {
	const validation = new ValidationHelpers(context);
	const { state } = validation.validate(Query, query);

	const datastore = new GameDatastore(context);

	const games = await datastore.getUserGames(context.userId, state);
	const results = games.map((x) => validation.validate(GameListResponse, x));

	response.json(results);
});

router.put(async ({ context, body }, response) => {
	const validation = new ValidationHelpers(context);
	const game = validation.validate(CreateGameRequest, body);

	const datastore = new GameDatastore(context);
	const id = await datastore.createGameForUser(context.userId, game);

	response.json(
		validation.validate(IdResponse, {
			id,
		}),
	);
});

export default APIHelper.getHandler(router);
