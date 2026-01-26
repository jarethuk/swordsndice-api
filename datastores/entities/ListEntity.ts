import type {BaseEntity} from './BaseEntity';

export interface ListEntity extends BaseEntity {
	userId: string;
	name: string;
	game: string;
	army: string;
	points: number;
	actualPoints: number;
	image?: string | null;
	description?: string | null;
	isDeleted: boolean;
	groups: any;
}
