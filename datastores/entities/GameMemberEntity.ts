import type { BaseEntity } from './BaseEntity';

export interface GameMemberEntity extends BaseEntity {
	gameId: string;
	userId: string;
	list?: any | null;
	points: number;
	isWinner?: boolean;
}
