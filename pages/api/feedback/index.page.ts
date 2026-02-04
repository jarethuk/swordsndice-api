import { FeedbackDatastore } from '../../../datastores/FeedbackDatastore.ts';
import { APIHelper, ValidationHelpers } from '../../../modules';
import { CreateFeedbackRequest } from '../../../types/requests/CreateFeedbackRequest.ts';
import { BasicResponse } from '../../../types/responses/BasicResponse.ts';

const router = APIHelper.getRouter({
	authenticate: true,
});

router.put(async ({ context, body }, response) => {
	const validation = new ValidationHelpers(context);
	const feedback = validation.validate(CreateFeedbackRequest, body);

	const datastore = new FeedbackDatastore(context);
	await datastore.createFeedback(context.userId, feedback);

	response.json(
		validation.validate(BasicResponse, {
			success: true,
		}),
	);
});

export default APIHelper.getHandler(router);
