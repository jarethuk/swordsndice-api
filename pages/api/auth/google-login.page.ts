import { OAuth2Client } from 'google-auth-library';
import { APIHelper, ValidationHelpers } from '../../../modules';
import { Authentication } from '../../../modules/Authentication.ts';
import { GoogleLoginRequest } from '../../../types/requests/GoogleLoginRequest.ts';

const router = APIHelper.getRouter();

// TODO: Bot protection on both endpoints
// TODO: Only send one email every minute

router.put(async (request, response) => {
	const { context, body } = request;
	const validator = new ValidationHelpers(context);
	const { token, code } = validator.validate(GoogleLoginRequest, body);

	try {
		let email: string;

		if (token) {
			const client = new OAuth2Client();

			const ticket = await client.verifyIdToken({
				idToken: token,
				audience: context.env.google.iosClientId,
			});

			const payload = ticket.getPayload();

			if (!payload || !payload.email) {
				throw new Error('Invalid token payload');
			}

			email = payload.email;
		} else if (code) {
			const client = new OAuth2Client({
				clientId: context.env.google.webClientId,
				clientSecret: context.env.google.webSecret,
				redirectUri: context.env.google.webRedirectUrl,
			});

			const { tokens } = await client.getToken(code);

			if (!tokens.id_token) {
				throw new Error('Invalid tokens');
			}

			const ticket = await client.verifyIdToken({
				idToken: tokens.id_token,
				audience: context.env.google.webClientId,
			});

			const payload = ticket.getPayload();

			if (!payload || !payload.email) {
				throw new Error('Invalid token payload');
			}

			email = payload.email;
		} else {
			throw new Error('Code or token required');
		}

		const authentication = new Authentication(context);
		await authentication.loginEmail(email, request, response);
	} catch (error) {
		throw context.tracer.getClientError('Failed to verify Google login', {
			error,
		});
	}
});

export default APIHelper.getHandler(router);
