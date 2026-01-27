import type { GroupEntity, UserEntity } from '../../../datastores/entities';
import { TestRecordHelpers } from '../../../helpers';
import { NextTestHelper } from '../../../modules';
import type { UserGroupInvite } from '../../../types/responses/UserGroupInvite.ts';
import handler from './invites.page';

describe('/groups/invites', () => {
	const url = '/api/groups/invites';

	const test = new NextTestHelper();
	let testRecordHelpers: TestRecordHelpers;
	let user: UserEntity;
	let friend: UserEntity;
	let group: GroupEntity;

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
		group = await testRecordHelpers.createGroup(user.id);
	});

	describe('GET /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'GET',
		});

		it('Should return a list of group invites for the user', async () => {
			await testRecordHelpers.createGroupInvite(friend.id, group.id, user.id);

			const { body } = await test.get({
				handler,
				url,
				user: friend,
			});

			expect(body).toEqual([
				{
					id: group.id,
					image: group.image,
					name: group.name,
					createdBy: {
						id: user.id,
						username: user.username,
						image: user.image,
					},
					description: group.description,
					createdAt: expect.any(String),
				},
			] as UserGroupInvite[]);
		});
	});
});
