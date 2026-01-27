import { GroupDatastore } from '../../../datastores/GroupDatastore.ts';
import { APIHelper, ValidationHelpers } from '../../../modules';
import { CreateGroupRequest } from '../../../types/requests/CreateGroupRequest.ts';
import { IdResponse } from '../../../types/responses/IdResponse.ts';
import { UserGroup } from '../../../types/responses/UserGroup.ts';

const router = APIHelper.getRouter({
	authenticate: true,
});

router.get(async ({ context }, response) => {
	const validation = new ValidationHelpers(context);
	const datastore = new GroupDatastore(context);

	const groups = await datastore.getGroupsForUser(context.userId);
	const results = groups.map((x) => validation.validate(UserGroup, x));

	response.json(results);
});

router.put(async ({ context, body }, response) => {
	const validation = new ValidationHelpers(context);
	const data = validation.validate(CreateGroupRequest, body);

	const datastore = new GroupDatastore(context);

	const id = await datastore.createGroupForUser(context.userId, data);

	response.json(
		validation.validate(IdResponse, {
			id,
		}),
	);
});

export default APIHelper.getHandler(router);
