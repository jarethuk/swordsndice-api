import {GroupDatastore} from '../../../datastores/GroupDatastore.ts';
import {APIHelper, ValidationHelpers} from '../../../modules';
import {UserGroupInvite} from '../../../types/responses/UserGroupInvite.ts';

const router = APIHelper.getRouter({
	authenticate: true,
});

router.get(async ({ context }, response) => {
	const validation = new ValidationHelpers(context);
	const datastore = new GroupDatastore(context);

	const groups = await datastore.getInvitesForUser(context.userId);
	const results = groups.map((x) => validation.validate(UserGroupInvite, x));

	response.json(results);
});

export default APIHelper.getHandler(router);
