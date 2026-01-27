import { v4 as uuid } from 'uuid';
import type { GroupEntity, UserEntity } from '../../../../datastores/entities';
import { TestRecordHelpers } from '../../../../helpers';
import { NextTestHelper } from '../../../../modules';
import handler from './leave.page';

describe('/groups/[id]/leave', () => {
	const url = '/api/groups/[id]/leave';

	const test = new NextTestHelper();
	let testRecordHelpers: TestRecordHelpers;
	let user: UserEntity;
	let otherUser: UserEntity;
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
		otherUser = await testRecordHelpers.createUser();
		group = await testRecordHelpers.createGroup(user.id);

		await testRecordHelpers.createGroupMember(otherUser.id, group.id);
	});

	describe('PATCH /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'PATCH',
			parameters: { id: uuid() },
		});

		it('Should NOT error if the group does not exist', async () => {
			await test.patch({
				handler,
				url,
				user,
				parameters: { id: uuid() },
			});
		});

		it('Should remove the group member record', async () => {
			const { body } = await test.patch({
				handler,
				url,
				user: otherUser,
				parameters: { id: group.id },
			});

			expect(body).toEqual({ success: true });

			const member = await test.database.groupMember.findFirst({
				where: { groupId: group.id, userId: otherUser.id },
			});

			expect(member).toBeNull();
		});

		it('Should delete the group when the last member leaves', async () => {
			const { body: body1 } = await test.patch({
				handler,
				url,
				user: otherUser,
				parameters: { id: group.id },
			});

			const { body: body2 } = await test.patch({
				handler,
				url,
				user,
				parameters: { id: group.id },
			});

			expect(body1).toEqual({ success: true });
			expect(body2).toEqual({ success: true });

			const count = await test.database.groupMember.count({
				where: { groupId: group.id },
			});

			expect(count).toEqual(0);

			const record = await test.database.group.findFirst({
				where: { id: group.id },
			});

			expect(record).toBeNull();
		});
	});
});
