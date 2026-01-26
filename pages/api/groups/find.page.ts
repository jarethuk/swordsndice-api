import {Expose, Type} from 'class-transformer';
import {IsNumber, IsOptional, IsString} from 'class-validator';
import {GroupDatastore} from '../../../datastores/GroupDatastore.ts';
import {APIHelper, ValidationHelpers} from '../../../modules';
import {GroupSearchResult} from '../../../types/responses/GroupSearchResult.ts';

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

	const datastore = new GroupDatastore(context);

	const groups = await datastore.findGroups(search);
	const results = groups.map((x) => validation.validate(GroupSearchResult, x));

	response.json(results);
});

export default APIHelper.getHandler(router);
