import {ListDatastore} from '../../../datastores';
import {APIHelper, ValidationHelpers} from '../../../modules';
import {ListBody} from '../../../types/ListBody.ts';
import {IdResponse} from '../../../types/responses/IdResponse.ts';

const router = APIHelper.getRouter({
	authenticate: true,
});

router.get(async ({ context }, response) => {
	const validation = new ValidationHelpers(context);
	const datastore = new ListDatastore(context);

	const groups = await datastore.getListsForUser(context.userId);
	const results = groups.map((x) => validation.validate(ListBody, x));

	response.json(results);
});

router.put(async ({ context, body }, response) => {
	const validation = new ValidationHelpers(context);
	const data = validation.validate(ListBody, body);

	const datastore = new ListDatastore(context);

	const id = await datastore.createListForUser(context.userId, data);

	response.json(
		validation.validate(IdResponse, {
			id,
		}),
	);
});

export default APIHelper.getHandler(router);
