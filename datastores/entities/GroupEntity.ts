import type { BaseEntity } from './BaseEntity';
import type { GroupInviteEntity } from './GroupInviteEntity';
import type { GroupMemberEntity } from './GroupMemberEntity';

export interface GroupEntity extends BaseEntity {
	createdByUserId: string;
	name: string;
	image?: string | null;
	description?: string | null;
	isPublic: boolean;
	isDeleted: boolean;
	members: GroupMemberEntity[];
	invites: GroupInviteEntity[];
	membersCanInvite: boolean;
}
