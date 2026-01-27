import type { GroupEntity, UserEntity } from '../../../datastores/entities';
import { TestRecordHelpers } from '../../../helpers';
import { NextTestHelper } from '../../../modules';
import type { UserGroup } from '../../../types/responses/UserGroup.ts';
import handler from './find.page';

describe('/groups/find', () => {
	const url = '/api/groups/find';

	const test = new NextTestHelper();
	let testRecordHelpers: TestRecordHelpers;
	let user: UserEntity;
	let group: GroupEntity;

	beforeAll(async () => {
		const context = await test.initialise(url);
		testRecordHelpers = new TestRecordHelpers(context);
	});

	afterAll(async () => {
		await test.end();
	});

	beforeEach(async () => {
		await test.database.group.deleteMany({});

		user = await testRecordHelpers.createUser();
		group = await testRecordHelpers.createGroup(user.id, {
			name: 'Test group 1',
		});

		await testRecordHelpers.createGroup(user.id, {
			isPublic: false,
			name: 'Test group 2',
		});
	});

	describe('GET /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'GET',
		});

		it('Should return public groups which match the term', async () => {
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
					id: group.id,
					image: group.image,
					name: group.name,
					description: group.description,
				},
			] as UserGroup[]);
		});
	});
});
