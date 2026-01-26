import {Expose} from 'class-transformer';
import {IsUUID} from 'class-validator';
import {GroupDatastore} from '../../../../datastores/GroupDatastore.ts';
import {APIHelper, ValidationHelpers} from '../../../../modules';
import {BasicResponse} from '../../../../types/responses/BasicResponse.ts';

class Query {
	@IsUUID()
	@Expose()
	public id!: string;
}

const router = APIHelper.getRouter({
	authenticate: true,
});

router.patch(async ({ context, query }, response) => {
	const validation = new ValidationHelpers(context);
	const { id } = validation.validate(Query, query);

	const datastore = new GroupDatastore(context);

	await datastore.leaveGroupForUser(context.userId, id);

	response.json(
		validation.validate(BasicResponse, {
			success: true,
		}),
	);
});

export default APIHelper.getHandler(router);
