import type { BaseEntity } from './BaseEntity.ts';

export interface GroupInviteEntity extends BaseEntity {
	createdByUserId: string;
	groupId: string;
	userId: string;
}
