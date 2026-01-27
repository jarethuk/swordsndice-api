import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { GroupDatastore } from '../../../../../datastores/GroupDatastore.ts';
import { APIHelper, ValidationHelpers } from '../../../../../modules';
import { InviteToGroupRequest } from '../../../../../types/requests/InviteToGroupRequest.ts';
import { BasicResponse } from '../../../../../types/responses/BasicResponse.ts';

class Query {
	@IsUUID()
	@Expose()
	public id!: string;
}

const router = APIHelper.getRouter({
	authenticate: true,
});

router.put(async ({ context, query, body }, response) => {
	const validation = new ValidationHelpers(context);
	const { id } = validation.validate(Query, query);
	const { friendId } = validation.validate(InviteToGroupRequest, body);

	const datastore = new GroupDatastore(context);

	await datastore.inviteToGroupForUser(context.userId, friendId, id);

	response.json(
		validation.validate(BasicResponse, {
			success: true,
		}),
	);
});

export default APIHelper.getHandler(router);
