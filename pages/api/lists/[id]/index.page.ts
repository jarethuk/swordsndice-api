import {Expose} from 'class-transformer';
import {IsUUID} from 'class-validator';
import {ListDatastore} from '../../../../datastores';
import {APIHelper, ValidationHelpers} from '../../../../modules';
import {ListBody} from '../../../../types/ListBody.ts';
import {BasicResponse} from '../../../../types/responses/BasicResponse.ts';

class Query {
	@IsUUID()
	@Expose()
	public id!: string;
}

const router = APIHelper.getRouter({
	authenticate: true,
});

router.get(async ({ context, query }, response) => {
	const validation = new ValidationHelpers(context);
	const { id } = validation.validate(Query, query);

	const datastore = new ListDatastore(context);

	const list = await datastore.getListForUser(context.userId, id);

	response.json(validation.validate(ListBody, list));
});

router.patch(async ({ context, query, body }, response) => {
	const validation = new ValidationHelpers(context);
	const { id } = validation.validate(Query, query);
	const data = validation.validate(ListBody, body);

	const datastore = new ListDatastore(context);

	await datastore.updateListForUser(context.userId, id, data);

	response.json(
		validation.validate(BasicResponse, {
			success: true,
		}),
	);
});

router.delete(async ({ context, query }, response) => {
	const validation = new ValidationHelpers(context);
	const { id } = validation.validate(Query, query);

	const datastore = new ListDatastore(context);

	await datastore.deleteListForUser(context.userId, id);

	response.json(
		validation.validate(BasicResponse, {
			success: true,
		}),
	);
});

export default APIHelper.getHandler(router);
