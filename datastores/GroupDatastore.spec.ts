import {v4 as uuid} from 'uuid';
import {TestFramework, TestRecordHelpers} from '../helpers';
import type {CreateGroupProps} from './GroupDatastore.ts';
import {GroupDatastore} from './GroupDatastore.ts';
import type {GroupEntity, UserEntity} from './entities';

describe('GroupDatastore', () => {
	let datastore: GroupDatastore;
	let testFramework: TestFramework;
	let testRecords: TestRecordHelpers;
	let user: UserEntity;
	let friend: UserEntity;

	beforeAll(async () => {
		testFramework = new TestFramework();
		await testFramework.initialise('group_datastore');

		datastore = new GroupDatastore(testFramework.getTestContext());
		testRecords = new TestRecordHelpers(testFramework.getTestContext());
	});

	beforeEach(async () => {
		user = await testRecords.createUser();
		friend = await testRecords.createUser();

		await testFramework.database.group.deleteMany();
	});

	afterAll(async () => {
		await testFramework.end();
	});

	describe('createGroupForUser', () => {
		it('Should create the group', async () => {
			const group: CreateGroupProps = {
				name: 'Test',
			};

			const result = await datastore.createGroupForUser(user.id, group);

			const records = await testFramework.database.group.findMany();
			expect(records).toHaveLength(1);
			expect(records[0].id).toEqual(result);
			expect(records[0].name).toEqual(group.name);
		});

		it('Should add the user as an admin', async () => {
			const group: CreateGroupProps = {
				name: 'Test',
			};

			const result = await datastore.createGroupForUser(user.id, group);
			const members = await testFramework.database.groupMember.findMany({
				where: { groupId: result },
			});
			expect(members).toHaveLength(1);
			expect(members[0].userId).toEqual(user.id);
			expect(members[0].isAdmin).toBeTruthy();
		});
	});

	describe('updateGroupForUser', () => {
		it('Should error if the group does not exist', async () => {
			await expect(() =>
				datastore.updateGroupForUser(user.id, uuid(), {
					name: 'New name',
				}),
			).rejects.toThrow('Group not found');
		});

		it('Should error if the group user is NOT a member of the group', async () => {
			const group = await testRecords.createGroup(user.id);
			const otherUser = await testRecords.createUser();

			await expect(() =>
				datastore.updateGroupForUser(otherUser.id, group.id, {
					name: 'New name',
				}),
			).rejects.toThrow('Group not found');
		});

		it('Should error if the user is NOT an admin', async () => {
			const group = await testRecords.createGroup(user.id);
			const otherUser = await testRecords.createUser();
			await testRecords.createGroupMember(otherUser.id, group.id);

			await expect(() =>
				datastore.updateGroupForUser(otherUser.id, group.id, {
					name: 'New name',
				}),
			).rejects.toThrow('Only admins can update a group');
		});

		it('Should update the group', async () => {
			const group = await testRecords.createGroup(user.id);

			await datastore.updateGroupForUser(user.id, group.id, {
				name: 'New name',
			});

			const records = await testFramework.database.group.findMany();
			expect(records).toHaveLength(1);
			expect(records[0].name).toEqual('New name');
		});
	});

	describe('deleteGroupForUser', () => {
		it('Should error if the group does not exist', async () => {
			await expect(() =>
				datastore.deleteGroupForUser(user.id, uuid()),
			).rejects.toThrow('Group not found');
		});

		it('Should error if the group user is NOT a member of the group', async () => {
			const group = await testRecords.createGroup(user.id);
			const otherUser = await testRecords.createUser();

			await expect(() =>
				datastore.deleteGroupForUser(otherUser.id, group.id),
			).rejects.toThrow('Group not found');
		});

		it('Should error if the user is NOT an admin', async () => {
			const group = await testRecords.createGroup(user.id);
			const otherUser = await testRecords.createUser();
			await testRecords.createGroupMember(otherUser.id, group.id);

			await expect(() =>
				datastore.deleteGroupForUser(otherUser.id, group.id),
			).rejects.toThrow('Only admins can update a group');
		});

		it('Should mark the group as deleted', async () => {
			const group = await testRecords.createGroup(user.id);

			await datastore.deleteGroupForUser(user.id, group.id);

			const records = await testFramework.database.group.findMany();
			expect(records).toHaveLength(1);
			expect(records[0].isDeleted).toBeTruthy();
		});
	});

	describe('joinGroupForUser', () => {
		it('Should error if the group does not exist', async () => {
			await expect(() =>
				datastore.joinGroupForUser(user.id, uuid()),
			).rejects.toThrow('Group not found');
		});

		describe('When the group is NOT public', () => {
			let group: GroupEntity;

			beforeEach(async () => {
				group = await testRecords.createGroup(user.id, {
					isPublic: false,
				});
			});

			it('Should error if an invite record does NOT exist', async () => {
				await expect(() =>
					datastore.joinGroupForUser(friend.id, group.id),
				).rejects.toThrow('Group is invite only');
			});

			it('Should delete the invite record and add the user to the group', async () => {
				await testRecords.createGroupInvite(friend.id, group.id);
				await datastore.joinGroupForUser(friend.id, group.id);

				const invites = await testFramework.database.groupInvite.findMany({
					where: { groupId: group.id },
				});
				expect(invites).toHaveLength(0);

				const members = await testFramework.database.groupMember.findMany({
					where: { userId: friend.id, groupId: group.id },
				});
				expect(members).toHaveLength(1);
				expect(members[0].isAdmin).toBeFalsy();
			});
		});

		describe('When the group is public', () => {
			it('Should add the user to the group', async () => {
				const group = await testRecords.createGroup(user.id, {
					isPublic: true,
				});

				await datastore.joinGroupForUser(friend.id, group.id);

				const members = await testFramework.database.groupMember.findMany({
					where: { userId: friend.id, groupId: group.id },
				});
				expect(members).toHaveLength(1);
				expect(members[0].isAdmin).toBeFalsy();
			});
		});

		it('Should NOT error if the user is already a member of the group', async () => {
			const group = await testRecords.createGroup(friend.id);
			await testRecords.createGroupMember(user.id, group.id);

			await datastore.joinGroupForUser(friend.id, group.id);
		});
	});

	describe('leaveGroupForUser', () => {
		let group: GroupEntity;

		beforeEach(async () => {
			group = await testRecords.createGroup(user.id);
		});

		it('Should NOT error if the user is NOT a member of the group', async () => {
			await datastore.leaveGroupForUser(friend.id, group.id);
		});

		it('Should leave the group', async () => {
			await datastore.joinGroupForUser(friend.id, group.id);
			await datastore.leaveGroupForUser(friend.id, group.id);

			const records = await testFramework.database.groupMember.findMany({
				where: { groupId: group.id },
			});
			expect(records).toHaveLength(1);
			expect(records[0].userId).toEqual(user.id);
		});

		it('Should delete the group if all members have left', async () => {
			await datastore.joinGroupForUser(friend.id, group.id);
			await datastore.leaveGroupForUser(friend.id, group.id);
			await datastore.leaveGroupForUser(user.id, group.id);

			const records = await testFramework.database.groupMember.findMany({
				where: { groupId: group.id },
			});
			expect(records).toHaveLength(0);

			const groups = await testFramework.database.group.findMany({
				where: { id: group.id },
			});
			expect(groups).toHaveLength(0);
		});
	});

	describe('getGroupForUser', () => {
		it('Should return groups a user is a member of', async () => {
			const group1 = await testRecords.createGroup(user.id);
			const group2 = await testRecords.createGroup(friend.id);
			await testRecords.createGroup(friend.id);

			await testRecords.createGroupMember(user.id, group2.id);

			const result = await datastore.getGroupsForUser(user.id);
			expect(result).toHaveLength(2);

			expect(result.find((x) => x.id === group1.id)).toEqual({
				id: group1.id,
				name: group1.name,
				description: group1.description,
				image: group1.image,
				isPublic: group1.isPublic,
				membersCanInvite: group1.membersCanInvite,
				createdBy: {
					id: user.id,
					username: user.username,
					image: user.image,
				},
			});

			expect(result.find((x) => x.id === group2.id)).toEqual({
				id: group2.id,
				name: group2.name,
				description: group2.description,
				image: group2.image,
				isPublic: group2.isPublic,
				membersCanInvite: group2.membersCanInvite,
				createdBy: {
					id: friend.id,
					username: friend.username,
					image: friend.image,
				},
			});
		});
	});

	describe('getInvitesForUser', () => {
		it('Should return groups a user has been invited to', async () => {
			const group = await testRecords.createGroup(friend.id);
			await testRecords.createGroupInvite(user.id, group.id, friend.id);

			const result = await datastore.getInvitesForUser(user.id);
			expect(result).toHaveLength(1);

			expect(result.find((x) => x.id === group.id)).toEqual({
				id: group.id,
				name: group.name,
				description: group.description,
				image: group.image,
				createdAt: expect.any(Date),
				createdBy: {
					id: friend.id,
					username: friend.username,
					image: friend.image,
				},
			});
		});
	});

	describe('findGroups', () => {
		it('Should return groups matching the search term', async () => {
			const group1 = await testRecords.createGroup(user.id, {
				name: 'Test 1',
			});

			const group2 = await testRecords.createGroup(user.id, {
				name: 'Test 2',
			});

			await testRecords.createGroup(user.id, {
				name: 'Something else 3',
			});

			const result = await datastore.findGroups('test');
			expect(result).toHaveLength(2);
			expect(result.find((x) => x.id === group2.id)).toEqual({
				id: group2.id,
				name: group2.name,
				description: group2.description,
				image: group2.image,
			});
		});
	});

	describe('inviteToGroupForUser', () => {
		it('Should create an invite record', async () => {
			const group = await testRecords.createGroup(user.id);
			await datastore.inviteToGroupForUser(user.id, friend.id, group.id);

			const result = await testFramework.database.groupInvite.findMany({
				where: {
					groupId: group.id,
					userId: friend.id,
				},
			});

			expect(result).toHaveLength(1);
			expect(result[0].createdByUserId).toEqual(user.id);
		});

		it('Should NOT create a record if the user is already a member of the group', async () => {
			const group = await testRecords.createGroup(user.id);
			await testRecords.createGroupMember(friend.id, group.id);

			await datastore.inviteToGroupForUser(user.id, friend.id, group.id);

			const result = await testFramework.database.groupInvite.findMany({
				where: {
					groupId: group.id,
					userId: friend.id,
				},
			});

			expect(result).toHaveLength(0);
		});

		it('Should NOT create a record if the user is already invited', async () => {
			const group = await testRecords.createGroup(user.id);
			await datastore.inviteToGroupForUser(user.id, friend.id, group.id);
			await datastore.inviteToGroupForUser(user.id, friend.id, group.id);

			const result = await testFramework.database.groupInvite.findMany({
				where: {
					groupId: group.id,
					userId: friend.id,
				},
			});

			expect(result).toHaveLength(1);
		});
	});

	describe('getGroupForUser', () => {
		it('Should return group information', async () => {
			const group = await testRecords.createGroup(user.id);
			await testRecords.createGroupMember(friend.id, group.id);

			const newUser = await testRecords.createUser();
			await testRecords.createGroupInvite(newUser.id, group.id, user.id);

			const result = await datastore.getGroupForUser(user.id, group.id);

			expect(result).toEqual({
				id: group.id,
				name: group.name,
				description: group.description,
				image: group.image,
				isPublic: group.isPublic,
				membersCanInvite: group.membersCanInvite,
				createdBy: {
					id: user.id,
					username: user.username,
					image: user.image,
				},
				members: [
					{
						id: user.id,
						username: user.username,
						image: user.image,
						isAdmin: true,
					},
					{
						id: friend.id,
						username: friend.username,
						image: friend.image,
						isAdmin: false,
					},
				],
				invites: [
					{
						user: {
							id: newUser.id,
							username: newUser.username,
							image: newUser.image,
						},
						createdBy: {
							id: user.id,
							username: user.username,
							image: user.image,
						},
					},
				],
			});
		});
	});

	describe('declineInviteForUser', () => {
		it('Should NOT error if the invite does not exist', async () => {
			await datastore.declineInviteForUser(friend.id, uuid());
		});

		it('Should delete the invite record', async () => {
			const group = await testRecords.createGroup(user.id);
			await testRecords.createGroupInvite(friend.id, group.id);

			await datastore.declineInviteForUser(friend.id, group.id);

			const records = await testFramework.database.groupInvite.findMany({
				where: { groupId: group.id, userId: friend.id },
			});

			expect(records).toHaveLength(0);
		});
	});

	describe('cancelInviteForUser', () => {
		it('Should error if the invite does not exist', async () => {
			await expect(() =>
				datastore.cancelInviteForUser(friend.id, uuid(), user.id),
			).rejects.toThrow('Group not found');
		});

		it('Should error if the user is NOT a member of the group', async () => {
			const group = await testRecords.createGroup(user.id);
			await testRecords.createGroupInvite(friend.id, group.id);

			await expect(() =>
				datastore.cancelInviteForUser(friend.id, group.id, user.id),
			).rejects.toThrow('Group not found');
		});

		it('Should error if the user is NOT an admin of the group', async () => {
			const group = await testRecords.createGroup(user.id);
			const otherMember = await testRecords.createUser();
			await testRecords.createGroupMember(otherMember.id, group.id);

			await testRecords.createGroupInvite(friend.id, group.id);

			await expect(() =>
				datastore.cancelInviteForUser(otherMember.id, group.id, user.id),
			).rejects.toThrow('Only admins can update a group');
		});

		it('Should delete the invite record', async () => {
			const group = await testRecords.createGroup(user.id);
			await testRecords.createGroupInvite(friend.id, group.id);

			await datastore.cancelInviteForUser(user.id, group.id, friend.id);

			const records = await testFramework.database.groupInvite.findMany({
				where: { groupId: group.id, userId: friend.id },
			});

			expect(records).toHaveLength(0);
		});
	});

	describe('updateMemberForUser', () => {
		let group: GroupEntity;
		let otherMember: UserEntity;

		beforeEach(async () => {
			group = await testRecords.createGroup(user.id);
			otherMember = await testRecords.createUser();
			await testRecords.createGroupMember(otherMember.id, group.id);
		});

		it('Should error if the group does not exist', async () => {
			await expect(() =>
				datastore.updateMemberForUser(friend.id, uuid(), user.id, {
					isAdmin: true,
				}),
			).rejects.toThrow('Group not found');
		});

		it('Should error if the user is NOT a member of the group', async () => {
			await expect(() =>
				datastore.updateMemberForUser(friend.id, group.id, user.id, {
					isAdmin: true,
				}),
			).rejects.toThrow('Group not found');
		});

		it('Should error if the user is NOT an admin of the group', async () => {
			await expect(() =>
				datastore.updateMemberForUser(otherMember.id, group.id, user.id, {
					isAdmin: true,
				}),
			).rejects.toThrow('Only admins can update a group');
		});

		it('Should update the member record', async () => {
			await datastore.updateMemberForUser(user.id, group.id, otherMember.id, {
				isAdmin: true,
			});

			const records = await testFramework.database.groupMember.findMany({
				where: { groupId: group.id, userId: otherMember.id },
			});

			expect(records).toHaveLength(1);
			expect(records[0].isAdmin).toBeTruthy();
		});
	});
});
