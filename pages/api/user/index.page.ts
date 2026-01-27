import { UserDatastore } from '../../../datastores';
import { APIHelper, ValidationHelpers } from '../../../modules';
import { UpdateUserRequest } from '../../../types/requests/UpdateUserRequest.ts';
import { BasicResponse } from '../../../types/responses/BasicResponse.ts';

const router = APIHelper.getRouter({
	authenticate: true,
});

router.patch(async ({ context, body }, response) => {
	const validation = new ValidationHelpers(context);
	const data = validation.validate(UpdateUserRequest, body);

	const datastore = new UserDatastore(context);

	if (data.username) {
		const existing = await datastore.getUserByUsername(data.username);

		if (existing && existing.id !== context.userId) {
			throw context.tracer.getClientError('Username already exists');
		}

		data.username = data.username.toLowerCase();
	}

	await datastore.updateUser(context.userId, data);

	response.json(
		validation.validate(BasicResponse, {
			success: true,
		}),
	);
});

export default APIHelper.getHandler(router);
