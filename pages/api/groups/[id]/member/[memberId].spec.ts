import { v4 as uuid } from 'uuid';
import type {
	GroupEntity,
	UserEntity,
} from '../../../../../datastores/entities';
import { TestRecordHelpers } from '../../../../../helpers';
import { NextTestHelper } from '../../../../../modules';
import type { UpdateGroupMemberRequest } from '../../../../../types/requests/UpdateGroupMemberRequest.ts';
import handler from './[memberId].page.ts';

describe('/groups/[id]/member/[memberId]', () => {
	const url = '/api/groups/[id]/member/[memberId]';

	const test = new NextTestHelper();
	let testRecordHelpers: TestRecordHelpers;
	let user: UserEntity;
	let otherUser: UserEntity;
	let group: GroupEntity;
	let data: UpdateGroupMemberRequest;

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

		data = {
			isAdmin: true,
		};
	});

	describe('PATCH /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'PATCH',
			parameters: { id: uuid() },
			data,
		});

		it('Should error if the group does not exist', async () => {
			await expect(() =>
				test.patch({
					handler,
					url,
					user,
					parameters: { id: uuid(), memberId: uuid() },
					data,
				}),
			).rejects.toThrow('Group not found');
		});

		it('Should error if the user is NOT an admin', async () => {
			await expect(() =>
				test.patch({
					handler,
					url,
					user: otherUser,
					parameters: { id: group.id, memberId: user.id },
					data,
				}),
			).rejects.toThrow('Only admins can update a group');
		});

		it('Should update the group member record', async () => {
			const { body } = await test.patch({
				handler,
				url,
				user,
				parameters: { id: group.id, memberId: otherUser.id },
				data,
			});

			expect(body).toEqual({ success: true });

			const member = await test.database.groupMember.findFirst({
				where: { groupId: group.id, userId: otherUser.id },
			});

			expect(member?.isAdmin).toBeTruthy();
		});
	});
});
