import type {UserEntity} from '../../../datastores/entities/UserEntity';
import {TestRecordHelpers} from '../../../helpers/TestRecordHelpers';
import {NextTestHelper} from '../../../modules/NextTestHelper';
import type {UserResponse} from '../../../types/responses/UserResponse';
import handler from './me.page';

describe('/auth/me', () => {
	const url = '/api/auth/me';

	const test = new NextTestHelper();
	let user: UserEntity;

	beforeAll(async () => {
		const context = await test.initialise(url);

		const testRecordHelpers = new TestRecordHelpers(context);
		user = await testRecordHelpers.createUser();
	});

	afterAll(async () => {
		await test.end();
	});

	it('Should return false when NOT logged in', async () => {
		const { text } = await test.get({
			handler,
			url,
		});

		expect(text).toEqual('false');
	});

	it('Should return false when the user does NOT exist', async () => {
		const { text } = await test.get({
			handler,
			url,
			user: {
				id: '2de471a9-a346-466e-b971-32e143997973',
			} as any,
		});

		expect(text).toEqual('false');
	});

	it('Should return the profile', async () => {
		const { body } = await test.get({
			handler,
			url,
			user,
		});

		expect(body).toEqual({
			id: user.id,
			username: user.username,
			email: user.email,
			image: null,
		} as UserResponse);
	});
});
