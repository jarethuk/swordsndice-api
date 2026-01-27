import { UserDatastore } from '../../../datastores/UserDatastore';
import { APIHelper } from '../../../modules/APIHelper';
import { ValidationHelpers } from '../../../modules/ValidationHelpers';
import { UserResponse } from '../../../types/responses/UserResponse';

const router = APIHelper.getRouter();

router.get(async ({ context }, response) => {
	const datastore = new UserDatastore(context);

	if (context.userId) {
		const user = await datastore.getUserById(context.userId);

		if (!user) {
			response.json(false);
		} else {
			const validation = new ValidationHelpers(context);

			response.json(validation.validate(UserResponse, user));
		}
	} else {
		response.json(false);
	}
});

export default APIHelper.getHandler(router);
