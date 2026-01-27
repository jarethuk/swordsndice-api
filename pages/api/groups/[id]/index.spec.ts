import { v4 as uuid } from 'uuid';
import type { GroupEntity, UserEntity } from '../../../../datastores/entities';
import { TestRecordHelpers } from '../../../../helpers';
import { NextTestHelper } from '../../../../modules';
import handler from './index.page';

describe('/groups/[id]', () => {
	const url = '/api/groups/[id]';

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
	});

	describe('GET /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'GET',
			parameters: { id: uuid() },
		});

		it('Should error if the group does not exist', async () => {
			await expect(() =>
				test.get({
					handler,
					url,
					user,
					parameters: { id: uuid() },
				}),
			).rejects.toThrow('Group not found');
		});

		it('Should return the group', async () => {
			const { body } = await test.get({
				handler,
				url,
				user,
				parameters: { id: group.id },
			});

			expect(body).toEqual({
				id: group.id,
				name: group.name,
				description: group.description,
				image: group.image,
				membersCanInvite: group.membersCanInvite,
				isPublic: group.isPublic,
				createdBy: {
					id: user.id,
					username: user.username,
					image: user.image,
				},
				invites: [],
				members: [
					{
						id: user.id,
						username: user.username,
						image: user.image,
						isAdmin: true,
					},
				],
			});
		});
	});

	describe('PATCH /', () => {
		const data = {
			name: 'new name',
			description: 'new description',
			image: 'new image',
			membersCanInvite: false,
		};

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
					parameters: { id: uuid() },
					data,
				}),
			).rejects.toThrow('Group not found');
		});

		it('Should error if the user is NOT a member', async () => {
			await expect(() =>
				test.patch({
					handler,
					url,
					user: otherUser,
					parameters: { id: group.id },
					data,
				}),
			).rejects.toThrow('Group not found');
		});

		it('Should error if the user is NOT an admin', async () => {
			await testRecordHelpers.createGroupMember(otherUser.id, group.id, false);

			await expect(() =>
				test.patch({
					handler,
					url,
					user: otherUser,
					parameters: { id: group.id },
					data,
				}),
			).rejects.toThrow('Only admins can update a group');
		});

		it('Should update the group', async () => {
			const { body } = await test.patch({
				handler,
				url,
				user,
				parameters: { id: group.id },
				data,
			});

			expect(body).toEqual({ success: true });

			const record = await test.database.group.findFirst({
				where: { id: group.id },
			});
			expect(record).toEqual(expect.objectContaining(data));
		});
	});

	describe('DELETE /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'DELETE',
			parameters: { id: uuid() },
		});

		it('Should error if the group does not exist', async () => {
			await expect(() =>
				test.delete({
					handler,
					url,
					user,
					parameters: { id: uuid() },
				}),
			).rejects.toThrow('Group not found');
		});

		it('Should error if the user is NOT a member', async () => {
			await expect(() =>
				test.delete({
					handler,
					url,
					user: otherUser,
					parameters: { id: group.id },
				}),
			).rejects.toThrow('Group not found');
		});

		it('Should error if the user is NOT an admin', async () => {
			await testRecordHelpers.createGroupMember(otherUser.id, group.id, false);

			await expect(() =>
				test.delete({
					handler,
					url,
					user: otherUser,
					parameters: { id: group.id },
				}),
			).rejects.toThrow('Only admins can update a group');
		});

		it('Should delete the group', async () => {
			const { body } = await test.delete({
				handler,
				url,
				user,
				parameters: { id: group.id },
			});

			expect(body).toEqual({ success: true });

			const record = await test.database.group.findFirst({
				where: { id: group.id },
			});
			expect(record).toBeDefined();
			expect(record?.isDeleted).toBeTruthy();
		});
	});
});
