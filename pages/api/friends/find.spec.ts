import type { UserEntity } from '../../../datastores/entities';
import { TestRecordHelpers } from '../../../helpers';
import { NextTestHelper } from '../../../modules';
import type { PublicUser } from '../../../types/responses/PublicUser.ts';
import handler from './find.page';

describe('/friends/find', () => {
	const url = '/api/friends/find';

	const test = new NextTestHelper();
	let testRecordHelpers: TestRecordHelpers;
	let user: UserEntity;
	let friend1: UserEntity;
	let friend2: UserEntity;

	beforeAll(async () => {
		const context = await test.initialise(url);
		testRecordHelpers = new TestRecordHelpers(context);
	});

	afterAll(async () => {
		await test.end();
	});

	beforeEach(async () => {
		await test.database.user.deleteMany({});

		user = await testRecordHelpers.createUser();

		friend1 = await testRecordHelpers.createUser({
			username: 'test2',
		});

		friend2 = await testRecordHelpers.createUser({
			username: 'bob',
		});
	});

	describe('GET /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'GET',
		});

		it('Should return users which match the term', async () => {
			const { body } = await test.get({
				handler,
				url,
				user,
				parameters: {
					search: 'test',
				},
			});

			expect(body).toEqual([
				{
					id: friend1.id,
					image: friend1.image,
					username: friend1.username,
					description: friend1.description,
				},
			] as PublicUser[]);
		});
	});
});
