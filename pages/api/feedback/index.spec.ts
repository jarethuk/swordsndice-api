import type { UserEntity } from '../../../datastores/entities';
import { TestRecordHelpers } from '../../../helpers';
import { NextTestHelper } from '../../../modules';
import type { CreateFeedbackRequest } from '../../../types/requests/CreateFeedbackRequest.ts';
import handler from './index.page';

describe('/feedback', () => {
	const url = '/api/feedback';

	const test = new NextTestHelper();
	let testRecordHelpers: TestRecordHelpers;
	let user: UserEntity;

	beforeAll(async () => {
		const context = await test.initialise(url);
		testRecordHelpers = new TestRecordHelpers(context);
	});

	afterAll(async () => {
		await test.end();
	});

	beforeEach(async () => {
		user = await testRecordHelpers.createUser();
	});

	describe('PUT /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'PUT',
		});

		it('Should create the feedback', async () => {
			const data = {
				rating: 5,
				message: 'This is a test message',
			} as CreateFeedbackRequest;

			const { body } = await test.put({
				handler,
				url,
				user,
				data,
			});

			expect(body).toEqual({
				success: true,
			});

			const record = await test.database.feedback.findFirst({
				where: { id: body.id },
			});

			expect(record).toEqual(
				expect.objectContaining({
					...data,
					createdByUserId: user.id,
				}),
			);
		});
	});
});
