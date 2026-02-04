import { WithContext } from '../modules';
import type { CreateFeedbackRequest } from '../types/requests/CreateFeedbackRequest.ts';

export class FeedbackDatastore extends WithContext {
	public async createFeedback(userId: string, feedback: CreateFeedbackRequest) {
		await this.context.database.feedback.create({
			data: {
				...feedback,
				createdByUserId: userId,
			},
		});
	}
}
