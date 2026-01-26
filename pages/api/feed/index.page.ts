import {FeedDatastore} from '../../../datastores/FeedDatastore.ts';
import {APIHelper, ValidationHelpers} from '../../../modules';
import {FeedItem} from '../../../types/responses/FeedItem.ts';

const router = APIHelper.getRouter({
	authenticate: true,
});

router.get(async ({ context }, response) => {
	const validation = new ValidationHelpers(context);

	const datastore = new FeedDatastore(context);

	const friends = await datastore.getFeedForUser(context.userId);
	const results = friends.map((x) => validation.validate(FeedItem, x));

	response.json(results);
});

export default APIHelper.getHandler(router);
