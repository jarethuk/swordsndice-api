import type {BaseEntity} from './BaseEntity';

export interface FriendEntity extends BaseEntity {
	userId: string;
	friendId: string;
}
