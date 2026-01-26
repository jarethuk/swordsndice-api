import type {ListEntity, UserEntity} from '../../../datastores/entities';
import {TestRecordHelpers} from '../../../helpers';
import {NextTestHelper} from '../../../modules';
import handler from './index.page';
import {ListBody} from '../../../types/ListBody.ts';

describe('/list', () => {
	const url = '/api/list';

	const test = new NextTestHelper();
	let testRecordHelpers: TestRecordHelpers;
	let user: UserEntity;
	let otherUser: UserEntity;

	let list1: ListEntity;
	let list2: ListEntity;

	beforeAll(async () => {
		const context = await test.initialise(url);
		testRecordHelpers = new TestRecordHelpers(context);
	});

	afterAll(async () => {
		await test.end();
	});

	beforeEach(async () => {
		user = await testRecordHelpers.createUser();
		otherUser = await testRecordHelpers.createUser();

		list1 = await testRecordHelpers.createList(user.id, {
			name: 'Test List 1',
		});

		list2 = await testRecordHelpers.createList(user.id, {
			name: 'Test List 2',
		});

		await testRecordHelpers.createList(user.id, {
			name: 'Deleted List',
			isDeleted: true,
		});

		await testRecordHelpers.createList(otherUser.id);
	});

	describe('GET /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'GET',
		});

		it('Should return lists owned by the user', async () => {
			const { body } = await test.get({
				handler,
				url,
				user,
			});

			expect(body).toEqual([
				{
					id: list1.id,
					name: list1.name,
					army: list1.army,
					points: list1.points,
					actualPoints: list1.actualPoints,
					groups: list1.groups,
					game: list1.game,
					description: list1.description,
					image: list1.image,
					isDeleted: list1.isDeleted,
				},
				{
					id: list2.id,
					name: list2.name,
					army: list2.army,
					points: list2.points,
					actualPoints: list2.actualPoints,
					groups: list2.groups,
					game: list2.game,
					description: list2.description,
					image: list2.image,
					isDeleted: list2.isDeleted,
				},
			]);
		});
	});

	describe('PUT', () => {
		const data: ListBody = {
			name: 'New list',
			army: 'Army',
			points: 100,
			game: 'Game',
			groups: [],
			actualPoints: 1,
		};

		test.checkAuthorised({
			handler,
			url,
			method: 'PUT',
			data,
		});

		it('Should create a list', async () => {
			const { body } = await test.put({
				handler,
				url,
				user,
				data,
			});

			expect(body).toEqual({
				id: expect.any(String),
			});

			const record = await test.database.list.findFirst({
				where: { id: body.id, userId: user.id },
			});

			expect(record).toBeDefined();
			expect(record).toEqual(expect.objectContaining(data));
		});
	});
});
