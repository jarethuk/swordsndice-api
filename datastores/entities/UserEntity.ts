import type { BaseEntity } from './BaseEntity';

export interface UserEntity extends BaseEntity {
	username?: string | null;
	email: string;
	image?: string | null;
	description?: string | null;
	lastLogin: Date;
}
