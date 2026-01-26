import {Expose, Type} from 'class-transformer';
import {IsNumber, IsOptional, IsString} from 'class-validator';
import {FriendDatastore} from '../../../datastores/FriendDatastore.ts';
import {APIHelper, ValidationHelpers} from '../../../modules';
import {PublicUser} from '../../../types/responses/PublicUser.ts';

class Query {
	@IsString()
	@Expose()
	public search!: string;

	@IsNumber()
	@IsOptional()
	@Expose()
	@Type(() => Number)
	public page?: number;
}

const router = APIHelper.getRouter({
	authenticate: true,
});

router.get(async ({ context, query }, response) => {
	const validation = new ValidationHelpers(context);
	const { search } = validation.validate(Query, query);

	const datastore = new FriendDatastore(context);

	const friends = await datastore.findFriends(search);
	const results = friends.map((x) => validation.validate(PublicUser, x));

	response.json(results);
});

export default APIHelper.getHandler(router);
