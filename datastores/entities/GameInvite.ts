import type {BaseEntity} from './BaseEntity.ts';

export interface GameInvite extends BaseEntity {
	userId: string;
	gameId: string;
}
