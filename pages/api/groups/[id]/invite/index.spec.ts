import { v4 as uuid } from 'uuid';
import type {
	GroupEntity,
	UserEntity,
} from '../../../../../datastores/entities';
import { TestRecordHelpers } from '../../../../../helpers';
import { NextTestHelper } from '../../../../../modules';
import handler from './index.page';

describe('/groups/[id]/invite', () => {
	const url = '/api/groups/[id]/invite';

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

	describe('PUT /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'PUT',
			parameters: { id: uuid() },
			data: {
				friendId: uuid(),
			},
		});

		it('Should create the invite', async () => {
			const { body } = await test.put({
				handler,
				url,
				user,
				parameters: { id: group.id },
				data: {
					friendId: friend.id,
				},
			});

			expect(body).toBeTruthy();

			const result = await test.database.groupInvite.findFirst({
				where: { groupId: group.id, userId: friend.id },
			});

			expect(result).toBeDefined();
		});
	});
});
