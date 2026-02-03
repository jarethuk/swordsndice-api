import { Expose, Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { ListDatastore, UserDatastore } from '../../../datastores';
import { FriendDatastore } from '../../../datastores/FriendDatastore.ts';
import { GameDatastore } from '../../../datastores/GameDatastore.ts';
import { APIHelper, ValidationHelpers } from '../../../modules';
import { PublicUserFull } from '../../../types/responses/PublicUserFull.ts';

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
		const listDatastore = new ListDatastore(context);
		const gameDatastore = new GameDatastore(context);

		const [isFriend, lists, games] = await Promise.all([
			friendDatastore.isFriend(context.userId, user.id),
			listDatastore.getRecentListsForUser(user.id),
			gameDatastore.getUserGames(user.id, 'complete', 5),
		]);

		response.json(
			validation.validate(PublicUserFull, {
				...user,
				isFriend,
				lists,
				games,
			}),
		);
	} else {
		response.json(false);
	}
});

export default APIHelper.getHandler(router);
