import {Expose} from 'class-transformer';
import {IsUUID} from 'class-validator';
import {GroupDatastore} from '../../../../datastores/GroupDatastore.ts';
import {APIHelper, ValidationHelpers} from '../../../../modules';
import {UpdateGroupRequest} from '../../../../types/requests/UpdateGroupRequest.ts';
import {BasicResponse} from '../../../../types/responses/BasicResponse.ts';
import {GroupResponse} from '../../../../types/responses/GroupResponse.ts';

class Query {
	@IsUUID()
	@Expose()
	public id!: string;
}

const router = APIHelper.getRouter({
	authenticate: true,
});

router.get(async ({ context, query }, response) => {
	const validation = new ValidationHelpers(context);
	const { id } = validation.validate(Query, query);

	const datastore = new GroupDatastore(context);

	const group = await datastore.getGroupForUser(context.userId, id);

	response.json(validation.validate(GroupResponse, group));
});

router.patch(async ({ context, query, body }, response) => {
	const validation = new ValidationHelpers(context);
	const { id } = validation.validate(Query, query);
	const data = validation.validate(UpdateGroupRequest, body);

	const datastore = new GroupDatastore(context);

	await datastore.updateGroupForUser(context.userId, id, data);

	response.json(
		validation.validate(BasicResponse, {
			success: true,
		}),
	);
});

router.delete(async ({ context, query }, response) => {
	const validation = new ValidationHelpers(context);
	const { id } = validation.validate(Query, query);

	const datastore = new GroupDatastore(context);

	await datastore.deleteGroupForUser(context.userId, id);

	response.json(
		validation.validate(BasicResponse, {
			success: true,
		}),
	);
});

export default APIHelper.getHandler(router);
