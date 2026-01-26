import {Expose} from 'class-transformer';
import {IsUUID} from 'class-validator';
import {GameDatastore} from '../../../../datastores/GameDatastore';
import {APIHelper, ValidationHelpers} from '../../../../modules';
import {BasicResponse} from '../../../../types/responses/BasicResponse.ts';
import {JoinGameRequest} from '../../../../types/requests/JoinGameRequest.ts';

const router = APIHelper.getRouter({
	authenticate: true,
});

class Query {
	@IsUUID()
	@Expose()
	public id!: string;
}

router.put(async ({ context, query, body }, response) => {
	const validation = new ValidationHelpers(context);
	const { id } = validation.validate(Query, query);
	const { inviteCode } = validation.validate(JoinGameRequest, body);

	const datastore = new GameDatastore(context);
	await datastore.joinGameByCodeForUser({
		userId: context.userId,
		gameId: id,
		inviteCode,
	});

	response.json(
		validation.validate(BasicResponse, {
			success: true,
		}),
	);
});

export default APIHelper.getHandler(router);
