import { getIronSession } from 'iron-session';
import type { NextApiRequest, NextApiResponse } from 'next';
import { UserDatastore } from '../datastores';
import type { UserEntity } from '../datastores/entities';
import { UserResponse } from '../types/responses/UserResponse.ts';
import { type SessionData, ironOptions } from './APIHelper.ts';
import type { Context } from './Context.ts';
import { ValidationHelpers } from './ValidationHelpers.ts';
import { WithContext } from './WithContext.ts';

export class Authentication extends WithContext {
	private datastore: UserDatastore;

	constructor(protected context: Context) {
		super(context);
		this.datastore = new UserDatastore(context);
	}

	public async loginEmail(
		email: string,
		request: NextApiRequest,
		response: NextApiResponse,
	) {
		const validator = new ValidationHelpers(this.context);
		let user = await this.datastore.getUserByEmail(email);

		if (!user) {
			user = {
				id: await this.datastore.createUser({
					email,
				}),
				email,
			} as UserEntity;
		}

		const { id, username, image } = user;

		await this.datastore.updateUser(id, {
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
	}
}
