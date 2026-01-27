import { Expose, Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { UserDatastore } from '../../../datastores';
import { FriendDatastore } from '../../../datastores/FriendDatastore.ts';
import { APIHelper, ValidationHelpers } from '../../../modules';
import { PublicUser } from '../../../types/responses/PublicUser.ts';

class Query {
	@IsString()
	@Transform(({ value }) => value.toLowerCase())
	@Expose()
	public username!: string;
}

const router = APIHelper.getRouter({
	authenticate: true,
});

router.get(async ({ context, query }, response) => {
	const validation = new ValidationHelpers(context);
	const { username } = validation.validate(Query, query);

	const datastore = new UserDatastore(context);
	const user = await datastore.getUserByUsername(username);

	if (user) {
		const friendDatastore = new FriendDatastore(context);
		const isFriend = await friendDatastore.isFriend(context.userId, user.id);

		response.json(
			validation.validate(PublicUser, {
				...user,
				isFriend,
			}),
		);
	} else {
		response.json(false);
	}
});

export default APIHelper.getHandler(router);
