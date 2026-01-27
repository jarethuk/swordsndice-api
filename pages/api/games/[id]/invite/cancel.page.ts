import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { GameDatastore } from '../../../../../datastores/GameDatastore.ts';
import { APIHelper, ValidationHelpers } from '../../../../../modules';
import { InviteUserToGameRequest } from '../../../../../types/requests/InviteUserToGameRequest.ts';
import { BasicResponse } from '../../../../../types/responses/BasicResponse.ts';

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
	const { friendId } = validation.validate(InviteUserToGameRequest, body);

	const datastore = new GameDatastore(context);
	await datastore.cancelInviteToGame({
		userId: context.userId,
		gameId: id,
		friendId,
	});

	response.json(
		validation.validate(BasicResponse, {
			success: true,
		}),
	);
});

export default APIHelper.getHandler(router);
