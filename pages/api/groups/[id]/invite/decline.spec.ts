import { v4 as uuid } from 'uuid';
import type {
	GroupEntity,
	UserEntity,
} from '../../../../../datastores/entities';
import { TestRecordHelpers } from '../../../../../helpers';
import { NextTestHelper } from '../../../../../modules';
import handler from './decline.page';

describe('/groups/[id]/invite/decline', () => {
	const url = '/api/groups/[id]/invite/decline';

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

	describe('PATCH /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'PATCH',
			parameters: { id: uuid() },
		});

		it('Should delete the invite', async () => {
			await testRecordHelpers.createGroupInvite(friend.id, group.id, user.id);

			const { body } = await test.patch({
				handler,
				url,
				user: friend,
				parameters: { id: group.id },
			});

			expect(body).toBeTruthy();

			const result = await test.database.groupInvite.findFirst({
				where: { groupId: group.id, userId: friend.id },
			});

			expect(result).toBeNull();
		});
	});
});
