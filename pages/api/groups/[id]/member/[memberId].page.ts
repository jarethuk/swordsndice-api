import {Expose} from 'class-transformer';
import {IsUUID} from 'class-validator';
import {GroupDatastore} from '../../../../../datastores/GroupDatastore.ts';
import {APIHelper, ValidationHelpers} from '../../../../../modules';
import {UpdateGroupMemberRequest} from '../../../../../types/requests/UpdateGroupMemberRequest.ts';
import {BasicResponse} from '../../../../../types/responses/BasicResponse.ts';

class Query {
	@IsUUID()
	@Expose()
	public id!: string;

	@IsUUID()
	@Expose()
	public memberId!: string;
}

const router = APIHelper.getRouter({
	authenticate: true,
});

router.patch(async ({ context, query, body }, response) => {
	const validation = new ValidationHelpers(context);
	const { id, memberId } = validation.validate(Query, query);
	const update = validation.validate(UpdateGroupMemberRequest, body);

	const datastore = new GroupDatastore(context);

	await datastore.updateMemberForUser(context.userId, id, memberId, update);

	response.json(
		validation.validate(BasicResponse, {
			success: true,
		}),
	);
});

router.delete(async ({ context, query, body }, response) => {
	const validation = new ValidationHelpers(context);
	const { id, memberId } = validation.validate(Query, query);

	const datastore = new GroupDatastore(context);
	await datastore.removeMemberFromGroupForUser(context.userId, id, memberId);

	response.json(
		validation.validate(BasicResponse, {
			success: true,
		}),
	);
});

export default APIHelper.getHandler(router);
