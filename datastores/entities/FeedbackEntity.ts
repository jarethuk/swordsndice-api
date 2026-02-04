import type { BaseEntity } from './BaseEntity';

export interface FeedbackEntity extends BaseEntity {
	createdByUserId: string;
	rating?: number;
	message?: string;
}
