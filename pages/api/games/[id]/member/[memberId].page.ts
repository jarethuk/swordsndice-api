import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { GameDatastore } from '../../../../../datastores/GameDatastore.ts';
import { APIHelper, ValidationHelpers } from '../../../../../modules';
import { UpdateGameMemberRequest } from '../../../../../types/requests/UpdateGameMemberRequest.ts';
import { BasicResponse } from '../../../../../types/responses/BasicResponse.ts';

const router = APIHelper.getRouter({
	authenticate: true,
});

class Query {
	@IsUUID()
	@Expose()
	public id!: string;

	@IsUUID()
	@Expose()
	public memberId!: string;
}

router.patch(async ({ context, query, body }, response) => {
	const validation = new ValidationHelpers(context);
	const { id, memberId } = validation.validate(Query, query);
	const update = validation.validate(UpdateGameMemberRequest, body);

	const datastore = new GameDatastore(context);
	await datastore.updateGameMember(context.userId, id, memberId, update);

	response.json(
		validation.validate(BasicResponse, {
			success: true,
		}),
	);
});

export default APIHelper.getHandler(router);
