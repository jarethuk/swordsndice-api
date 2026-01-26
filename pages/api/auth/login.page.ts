import {getIronSession} from 'iron-session';
import {UserDatastore} from '../../../datastores/UserDatastore';
import type {UserEntity} from '../../../datastores/entities/UserEntity';
import {APIHelper, ironOptions, type SessionData,} from '../../../modules/APIHelper';
import {EmailManager} from '../../../modules/EmailManager';
import {ValidationHelpers} from '../../../modules/ValidationHelpers';
import {LoginRequest} from '../../../types/requests/LoginRequest';
import {BasicResponse} from '../../../types/responses/BasicResponse';
import {UserResponse} from '../../../types/responses/UserResponse';

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

		let user = await datastore.getUserByEmail(email);

		if (!user) {
			user = {
				id: await datastore.createUser({
					email,
				}),
				email,
			} as UserEntity;
		}

		const { id, username, image } = user;

		await datastore.updateUser(id, {
			lastLogin: new Date(),
		});

		const session = await getIronSession<SessionData>(
			request,
			response,
			ironOptions,
		);

		session.userId = id;

		await session.save();

		response.json(
			validator.validate(UserResponse, {
				id,
				email,
				username,
				image,
			} as UserResponse),
		);
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
