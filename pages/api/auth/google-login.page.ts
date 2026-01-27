import { OAuth2Client } from 'google-auth-library';
import { APIHelper } from '../../../modules/APIHelper';
import { Authentication } from '../../../modules/Authentication.ts';
import { ValidationHelpers } from '../../../modules/ValidationHelpers';
import { GoogleLoginRequest } from '../../../types/requests/GoogleLoginRequest.ts';

const router = APIHelper.getRouter();

// TODO: Bot protection on both endpoints
// TODO: Only send one email every minute

router.put(async (request, response) => {
	const { context, body } = request;
	const validator = new ValidationHelpers(context);
	const { token } = validator.validate(GoogleLoginRequest, body);

	try {
		const client = new OAuth2Client();
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience:
				'680803508827-fvfh2d9i04s4phicu7dchkm2jjpanitn.apps.googleusercontent.com',
		});

		const payload = ticket.getPayload();

		if (!payload || !payload.email) {
			throw new Error('Invalid token payload');
		}

		const authentication = new Authentication(context);
		await authentication.loginEmail(payload.email, request, response);
	} catch (error) {
		throw context.tracer.getClientError('Invalid token', { error });
	}
});

export default APIHelper.getHandler(router);
