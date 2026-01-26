import {v4 as uuid} from 'uuid';
import type {GroupEntity, UserEntity} from '../../../../datastores/entities';
import {TestRecordHelpers} from '../../../../helpers';
import {NextTestHelper} from '../../../../modules';
import handler from './join.page';

describe('/groups/[id]/join', () => {
	const url = '/api/groups/[id]/join';

	const test = new NextTestHelper();
	let testRecordHelpers: TestRecordHelpers;
	let user: UserEntity;
	let otherUser: UserEntity;
	let group: GroupEntity;
	let privateGroup: GroupEntity;

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
		privateGroup = await testRecordHelpers.createGroup(user.id, {
			isPublic: false,
		});
	});

	describe('PATCH /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'PATCH',
			parameters: { id: uuid() },
		});

		it('Should error if the group does not exist', async () => {
			await expect(() =>
				test.patch({
					handler,
					url,
					user,
					parameters: { id: uuid() },
				}),
			).rejects.toThrow('Group not found');
		});

		describe('When the group is NOT public', () => {
			it('Should error if the user is NOT invited', async () => {
				await expect(() =>
					test.patch({
						handler,
						url,
						user: otherUser,
						parameters: { id: privateGroup.id },
					}),
				).rejects.toThrow('Group is invite only');
			});

			it('Should join the group and remove the invite', async () => {
				await testRecordHelpers.createGroupInvite(
					otherUser.id,
					privateGroup.id,
				);

				await test.patch({
					handler,
					url,
					user: otherUser,
					parameters: { id: privateGroup.id },
				});

				const members = await test.database.groupMember.findMany({
					where: { groupId: privateGroup.id },
				});

				expect(members).toHaveLength(2);

				const invite = await test.database.groupInvite.findFirst({
					where: { groupId: privateGroup.id, userId: otherUser.id },
				});

				expect(invite).toBeNull();
			});
		});

		it('Should join a public group', async () => {
			const { body } = await test.patch({
				handler,
				url,
				user: otherUser,
				parameters: { id: group.id },
			});

			expect(body).toEqual({ success: true });

			const members = await test.database.groupMember.findMany({
				where: { groupId: group.id },
			});

			expect(members).toHaveLength(2);

			const invite = await test.database.groupInvite.findFirst({
				where: { groupId: group.id, userId: otherUser.id },
			});

			expect(invite).toBeNull();
		});
	});
});
