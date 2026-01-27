import type { GroupEntity, UserEntity } from '../../../datastores/entities';
import { TestRecordHelpers } from '../../../helpers';
import { NextTestHelper } from '../../../modules';
import handler from './index.page';

describe('/user', () => {
	const url = '/api/user';

	const test = new NextTestHelper();
	let testRecordHelpers: TestRecordHelpers;
	let user: UserEntity;
	let friend: UserEntity;
	let group: GroupEntity;

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

	describe('PATCH /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'PATCH',
			data: {
				email: 'test@test.com',
			},
		});

		it('Should update the current user', async () => {
			const { body } = await test.patch({
				handler,
				url,
				user,
				data: {
					username: 'new username',
				},
			});

			expect(body).toEqual({
				success: true,
			});

			const record = await test.database.user.findFirst({
				where: { id: user.id },
			});

			expect(record?.username).toEqual('new username');
		});
	});
});
