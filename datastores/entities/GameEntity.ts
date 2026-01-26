import type {BaseEntity} from './BaseEntity';
import type {GameMemberEntity} from './GameMemberEntity';

export interface GameEntity extends BaseEntity {
	createdByUserId: string;
	inviteCode: string;
	game: string;
	points: number;
	image?: string | null;
	description?: string | null;
	isStarted: boolean;
	isComplete: boolean;
	members?: GameMemberEntity[];
}
