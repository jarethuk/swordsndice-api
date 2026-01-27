import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { GameDatastore } from '../../../../datastores/GameDatastore';
import { APIHelper, ValidationHelpers } from '../../../../modules';
import { UpdateGameRequest } from '../../../../types/requests/UpdateGameRequest.ts';
import { BasicResponse } from '../../../../types/responses/BasicResponse.ts';
import { GameResponse } from '../../../../types/responses/GameResponse';

const router = APIHelper.getRouter({
	authenticate: true,
});

class Query {
	@IsUUID()
	@Expose()
	public id!: string;
}

router.get(async ({ context, query }, response) => {
	const validation = new ValidationHelpers(context);

	const { id } = validation.validate(Query, query);

	const datastore = new GameDatastore(context);
	const game = await datastore.getGameForUser(context.userId, id);

	response.json(validation.validate(GameResponse, game));
});

router.patch(async ({ context, query, body }, response) => {
	const validation = new ValidationHelpers(context);
	const { id } = validation.validate(Query, query);
	const update = validation.validate(UpdateGameRequest, body);

	const datastore = new GameDatastore(context);
	await datastore.updateGameForUser(context.userId, id, update);

	response.json(
		validation.validate(BasicResponse, {
			success: true,
		}),
	);
});

router.delete(async ({ context, query }, response) => {
	const validation = new ValidationHelpers(context);
	const { id } = validation.validate(Query, query);

	const datastore = new GameDatastore(context);
	await datastore.deleteGameForUser(context.userId, id);

	response.json(
		validation.validate(BasicResponse, {
			success: true,
		}),
	);
});

export default APIHelper.getHandler(router);
