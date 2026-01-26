import {FriendDatastore} from '../../../datastores/FriendDatastore.ts';
import {APIHelper, ValidationHelpers} from '../../../modules';
import {PublicUser} from '../../../types/responses/PublicUser.ts';

const router = APIHelper.getRouter({
	authenticate: true,
});

router.get(async ({ context }, response) => {
	const validation = new ValidationHelpers(context);
	const datastore = new FriendDatastore(context);

	const friends = await datastore.getFriendsForUser(context.userId);
	const results = friends.map((x) => validation.validate(PublicUser, x));

	response.json(results);
});

export default APIHelper.getHandler(router);
