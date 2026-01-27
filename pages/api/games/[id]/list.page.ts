import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { GameDatastore } from '../../../../datastores/GameDatastore';
import { APIHelper, ValidationHelpers } from '../../../../modules';
import { ListBody } from '../../../../types/ListBody.ts';
import { BasicResponse } from '../../../../types/responses/BasicResponse.ts';

const router = APIHelper.getRouter({
	authenticate: true,
});

class Query {
	@IsUUID()
	@Expose()
	public id!: string;
}

router.patch(async ({ context, query, body }, response) => {
	const validation = new ValidationHelpers(context);
	const { id } = validation.validate(Query, query);
	const list = validation.validate(ListBody, body);

	const datastore = new GameDatastore(context);
	await datastore.setGameListForUser({
		userId: context.userId,
		gameId: id,
		list,
	});

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
	await datastore.setGameListForUser({
		userId: context.userId,
		gameId: id,
		list: null,
	});

	response.json(
		validation.validate(BasicResponse, {
			success: true,
		}),
	);
});

export default APIHelper.getHandler(router);
