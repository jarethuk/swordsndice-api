import { TestFramework, TestRecordHelpers } from '../helpers';
import type { CreateFeedbackRequest } from '../types/requests/CreateFeedbackRequest.ts';
import { FeedbackDatastore } from './FeedbackDatastore.ts';
import type { UserEntity } from './entities';

describe('FeedbackDatastore', () => {
	let datastore: FeedbackDatastore;
	let testFramework: TestFramework;
	let testRecords: TestRecordHelpers;
	let user: UserEntity;

	beforeAll(async () => {
		testFramework = new TestFramework();
		await testFramework.initialise('feedback_datastore');

		datastore = new FeedbackDatastore(testFramework.getTestContext());
		testRecords = new TestRecordHelpers(testFramework.getTestContext());

		user = await testRecords.createUser();
	});

	describe('createFeedback', () => {
		it('Should create the feedback record', async () => {
			const feedback = {
				rating: 5,
				message: 'Test feedback',
			} as CreateFeedbackRequest;

			await datastore.createFeedback(user.id, feedback);

			const records = await testFramework.database.feedback.findMany();
			expect(records).toHaveLength(1);
			expect(records[0]).toEqual(
				expect.objectContaining({
					...feedback,
					createdByUserId: user.id,
				}),
			);
		});
	});
});
