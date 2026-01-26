import type {UserEntity} from '../../../datastores/entities';
import {TestRecordHelpers} from '../../../helpers';
import {NextTestHelper} from '../../../modules';
import type {PublicUser} from '../../../types/responses/PublicUser.ts';
import handler from './[username].page';

describe('/user/[username]', () => {
	const url = '/api/user[username]';

	const test = new NextTestHelper();
	let testRecordHelpers: TestRecordHelpers;
	let user: UserEntity;
	let otherUser: UserEntity;

	beforeAll(async () => {
		const context = await test.initialise(url);
		testRecordHelpers = new TestRecordHelpers(context);
	});

	afterAll(async () => {
		await test.end();
	});

	beforeEach(async () => {
		user = await testRecordHelpers.createUser();
		otherUser = await testRecordHelpers.createUser();
	});

	describe('GET /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'GET',
			parameters: {
				username: 'test',
			},
		});

		it('Should return false if the username does NOT exist', async () => {
			const { body } = await test.get({
				handler,
				url,
				user,
				parameters: {
					username: 'bob',
				},
			});

			expect(body).toBeFalsy();
		});

		it('Should get the user by username', async () => {
			const { body } = await test.get({
				handler,
				url,
				user,
				parameters: {
					username: otherUser.username,
				},
			});

			expect(body).toEqual({
				id: otherUser.id,
				username: otherUser.username,
				image: otherUser.image,
				isFriend: false,
				description: otherUser.description,
			} as PublicUser);
		});

		it('Should return true when the user is a friend', async () => {
			const otherUser = await testRecordHelpers.createUser();
			await testRecordHelpers.createFriend(user.id, otherUser.id);

			const { body } = await test.get({
				handler,
				url,
				user,
				parameters: {
					username: otherUser.username,
				},
			});

			expect(body).toEqual({
				id: otherUser.id,
				username: otherUser.username,
				image: otherUser.image,
				isFriend: true,
				description: otherUser.description,
			} as PublicUser);
		});
	});
});
