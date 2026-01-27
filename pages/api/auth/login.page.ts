import { UserDatastore } from '../../../datastores/UserDatastore';
import { APIHelper } from '../../../modules/APIHelper';
import { Authentication } from '../../../modules/Authentication.ts';
import { EmailManager } from '../../../modules/EmailManager';
import { ValidationHelpers } from '../../../modules/ValidationHelpers';
import { LoginRequest } from '../../../types/requests/LoginRequest';
import { BasicResponse } from '../../../types/responses/BasicResponse';

const router = APIHelper.getRouter();

// TODO: Bot protection on both endpoints
// TODO: Only send one email every minute

router.put(async (request, response) => {
	const { context, body } = request;
	const validator = new ValidationHelpers(context);
	const { email, code } = validator.validate(LoginRequest, body);

	const datastore = new UserDatastore(context);

	if (code) {
		await datastore.useLoginToken({ code, email });

		const authentication = new Authentication(context);
		await authentication.loginEmail(email, request, response);
	} else {
		const code = await datastore.createUserLoginToken(email);

		const emailManager = new EmailManager(context);
		await emailManager.sendLoginEmail({ email, code });

		response.json(
			validator.validate(BasicResponse, {
				success: true,
			}),
		);
	}
});

export default APIHelper.getHandler(router);
