import type {BaseEntity} from './BaseEntity';

export interface GroupMemberEntity extends BaseEntity {
	groupId: string;
	userId: string;
	isAdmin: boolean;
}
