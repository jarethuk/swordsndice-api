import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { FriendDatastore } from '../../../datastores/FriendDatastore.ts';
import { APIHelper, ValidationHelpers } from '../../../modules';

class Query {
	@IsUUID()
	@Expose()
	public friendId!: string;
}

const router = APIHelper.getRouter({
	authenticate: true,
});

router.put(async ({ context, query }, response) => {
	const validation = new ValidationHelpers(context);
	const { friendId } = validation.validate(Query, query);

	const datastore = new FriendDatastore(context);
	await datastore.addFriendForUser(context.userId, friendId);

	response.json(true);
});

router.delete(async ({ context, query }, response) => {
	const validation = new ValidationHelpers(context);
	const { friendId } = validation.validate(Query, query);

	const datastore = new FriendDatastore(context);
	await datastore.removeFriendForUser(context.userId, friendId);

	response.json(true);
});

export default APIHelper.getHandler(router);
