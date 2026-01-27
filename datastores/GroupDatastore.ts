import { WithContext } from '../modules';
import type {
	GroupResponse,
	GroupResponseMember,
} from '../types/responses/GroupResponse.ts';
import type { GroupSearchResult } from '../types/responses/GroupSearchResult.ts';
import type { UserGroup } from '../types/responses/UserGroup.ts';
import type { UserGroupInvite } from '../types/responses/UserGroupInvite.ts';
import type { GroupEntity, GroupMemberEntity } from './entities';

export interface CreateGroupProps {
	name: string;
	description?: string;
	image?: string | null;
	isPublic?: boolean;
	membersCanInvite?: boolean;
}

export interface UpdateGroupProps {
	name?: string;
	description?: string;
	image?: string | null;
	isPublic?: boolean;
	membersCanInvite?: boolean;
}

export interface UpdateGroupMemberProps {
	isAdmin?: boolean;
}

export class GroupDatastore extends WithContext {
	public async createGroupForUser(
		userId: string,
		props: CreateGroupProps,
	): Promise<string> {
		const group = {
			...props,
			createdByUserId: userId,
		};

		const { id } = await this.context.database.group.create({ data: group });
		await this.context.database.groupMember.create({
			data: { userId, groupId: id, isAdmin: true },
		});

		return id;
	}

	private async ensureAdmin(userId: string, groupId: string) {
		const member = await this.getGroupMember(userId, groupId, true);

		if (!member) {
			throw this.context.tracer.getClientError('Group not found');
		}

		if (!member.isAdmin) {
			throw this.context.tracer.getClientError(
				'Only admins can update a group',
			);
		}
	}

	public async updateGroupForUser(
		userId: string,
		groupId: string,
		props: UpdateGroupProps,
	) {
		await this.ensureAdmin(userId, groupId);

		await this.context.database.group.update({
			where: { id: groupId },
			data: props,
		});
	}

	public async removeMemberFromGroupForUser(
		userId: string,
		groupId: string,
		memberUserId: string,
	) {
		await this.ensureAdmin(userId, groupId);

		await this.context.database.groupMember.deleteMany({
			where: { userId: memberUserId, groupId },
		});
	}

	public async deleteGroupForUser(userId: string, groupId: string) {
		await this.ensureAdmin(userId, groupId);

		await this.context.database.group.update({
			where: { id: groupId },
			data: {
				isDeleted: true,
			},
		});
	}

	private async getGroup(groupId: string): Promise<GroupEntity> {
		const group = await this.context.database.group.findUnique({
			where: { id: groupId },
		});

		if (!group) {
			throw this.context.tracer.getClientError('Group not found');
		}

		return group as GroupEntity;
	}

	private async getGroupMember(
		userId: string,
		groupId: string,
		shouldThrow = false,
	): Promise<GroupMemberEntity | null> {
		const member = await this.context.database.groupMember.findFirst({
			where: { userId, groupId },
		});

		if (!member && shouldThrow) {
			throw this.context.tracer.getClientError('Group not found');
		}

		return member;
	}

	public async joinGroupForUser(userId: string, groupId: string) {
		const member = await this.getGroupMember(userId, groupId);

		if (member) return;

		const group = await this.getGroup(groupId);

		if (!group.isPublic) {
			const invite = await this.context.database.groupInvite.findFirst({
				where: { groupId, userId },
			});

			if (!invite) {
				throw this.context.tracer.getClientError('Group is invite only');
			}

			await this.context.database.groupInvite.delete({
				where: { id: invite.id },
			});
		}

		await this.context.database.groupMember.create({
			data: { userId, groupId },
		});
	}

	public async leaveGroupForUser(userId: string, groupId: string) {
		await this.context.database.groupMember.deleteMany({
			where: { userId, groupId },
		});

		const memberCount = await this.context.database.groupMember.count({
			where: { groupId },
		});

		if (memberCount === 0) {
			await this.context.database.group.deleteMany({ where: { id: groupId } });
		}
	}

	public async getGroupsForUser(userId: string): Promise<UserGroup[]> {
		const records = await this.context.database.groupMember.findMany({
			where: { userId },
			select: {
				group: {
					select: {
						id: true,
						name: true,
						description: true,
						image: true,
						isPublic: true,
						membersCanInvite: true,
						createdBy: {
							select: { id: true, username: true, image: true },
						},
					},
				},
			},
		});

		return records.map(({ group }) => group as UserGroup);
	}

	public async getInvitesForUser(userId: string): Promise<UserGroupInvite[]> {
		const records = await this.context.database.groupInvite.findMany({
			where: { userId },
			select: {
				group: {
					select: {
						id: true,
						name: true,
						description: true,
						image: true,
						isPublic: true,
						membersCanInvite: true,
					},
				},
				createdAt: true,
				createdBy: {
					select: { id: true, username: true, image: true },
				},
			},
		});

		return records.map(
			({ group, createdAt, createdBy }) =>
				({
					id: group.id,
					name: group.name,
					image: group.image,
					description: group.description,
					createdAt,
					createdBy,
				}) as UserGroupInvite,
		);
	}

	public async findGroups(
		search: string,
		page = 1,
	): Promise<GroupSearchResult[]> {
		const records = await this.context.database.group.findMany({
			where: {
				name: {
					contains: search,
					mode: 'insensitive',
				},
				isPublic: true,
				isDeleted: false,
			},
			select: {
				id: true,
				name: true,
				description: true,
				image: true,
			},
			orderBy: { name: 'asc' },
			take: 50,
			skip: (page - 1) * 50,
		});

		return records.map((r) => ({
			id: r.id,
			name: r.name,
			image: r.image,
			description: r.description,
		})) as GroupSearchResult[];
	}

	public async inviteToGroupForUser(
		userId: string,
		friendId: string,
		groupId: string,
	) {
		const member = await this.getGroupMember(friendId, groupId);

		if (member) return;

		const invite = await this.context.database.groupInvite.findFirst({
			where: { groupId, userId: friendId },
		});

		if (invite) return;

		await this.context.database.groupInvite.create({
			data: { userId: friendId, groupId, createdByUserId: userId },
		});
	}

	public async getGroupForUser(
		userId: string,
		groupId: string,
	): Promise<GroupResponse> {
		const group = await this.context.database.group.findFirst({
			where: { id: groupId },
			select: {
				id: true,
				name: true,
				description: true,
				image: true,
				isPublic: true,
				membersCanInvite: true,
				createdBy: {
					select: { id: true, username: true, image: true },
				},
				members: {
					select: {
						user: {
							select: {
								id: true,
								username: true,
								image: true,
							},
						},
						isAdmin: true,
					},
				},
				invites: {
					select: {
						user: {
							select: {
								id: true,
								username: true,
								image: true,
							},
						},
						createdBy: {
							select: {
								id: true,
								username: true,
								image: true,
							},
						},
					},
				},
			},
		});

		const isMember = !!group?.members.find((m) => m.user.id === userId);

		if (!group || (!group.isPublic && !isMember)) {
			throw this.context.tracer.getClientError('Group not found');
		}

		return {
			...group,
			invites: group.invites.map((i) => ({
				user: {
					id: i.user.id,
					image: i.user.image,
					username: i.user.username ?? '',
				},
				createdBy: {
					id: i.createdBy.id,
					image: i.createdBy.image,
					username: i.createdBy.username ?? '',
				},
			})),
			members: group.members.map(
				(i) =>
					({
						id: i.user.id,
						image: i.user.image,
						username: i.user.username,
						isAdmin: i.isAdmin,
					}) as GroupResponseMember,
			),
		};
	}

	public async declineInviteForUser(userId: string, groupId: string) {
		await this.context.database.groupInvite.deleteMany({
			where: { userId, groupId },
		});
	}

	public async cancelInviteForUser(
		userId: string,
		groupId: string,
		friendId: string,
	) {
		await this.ensureAdmin(userId, groupId);

		await this.context.database.groupInvite.deleteMany({
			where: { userId: friendId, groupId },
		});
	}

	public async updateMemberForUser(
		userId: string,
		groupId: string,
		memberUserId: string,
		data: UpdateGroupMemberProps,
	) {
		await this.ensureAdmin(userId, groupId);

		await this.context.database.groupMember.updateMany({
			where: { userId: memberUserId, groupId },
			data,
		});
	}
}
