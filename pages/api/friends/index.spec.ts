import type {UserEntity} from '../../../datastores/entities';
import {TestRecordHelpers} from '../../../helpers';
import {NextTestHelper} from '../../../modules';
import type {PublicUser} from '../../../types/responses/PublicUser.ts';
import handler from './index.page';

describe('/friends', () => {
	const url = '/api/friends';

	const test = new NextTestHelper();
	let testRecordHelpers: TestRecordHelpers;
	let user: UserEntity;
	let friend: UserEntity;

	beforeAll(async () => {
		const context = await test.initialise(url);
		testRecordHelpers = new TestRecordHelpers(context);
	});

	afterAll(async () => {
		await test.end();
	});

	beforeEach(async () => {
		user = await testRecordHelpers.createUser();
		friend = await testRecordHelpers.createUser();

		await testRecordHelpers.createFriend(user.id, friend.id);
	});

	describe('GET /', () => {
		beforeEach(async () => {
			// Should not return friends of other users
			const otherUser = await testRecordHelpers.createUser();
			await testRecordHelpers.createFriend(otherUser.id, friend.id);
		});

		test.checkAuthorised({
			handler,
			url,
			method: 'GET',
		});

		it('Should return a list of friends for the user', async () => {
			const { body } = await test.get({
				handler,
				url,
				user,
			});

			expect(body).toEqual([
				{
					id: friend.id,
					username: friend.username,
					image: friend.image,
				},
			] as PublicUser[]);
		});
	});
});
