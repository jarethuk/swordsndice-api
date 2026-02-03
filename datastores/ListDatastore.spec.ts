import { v4 as uuid } from 'uuid';
import { TestFramework, TestRecordHelpers } from '../helpers';
import { type CreateListProps, ListDatastore } from './ListDatastore.ts';
import type { UserEntity } from './entities';

describe('ListDatastore', () => {
	let datastore: ListDatastore;
	let testFramework: TestFramework;
	let testRecords: TestRecordHelpers;
	let user: UserEntity;

	beforeAll(async () => {
		testFramework = new TestFramework();
		await testFramework.initialise('list_datastore');

		datastore = new ListDatastore(testFramework.getTestContext());
		testRecords = new TestRecordHelpers(testFramework.getTestContext());
	});

	beforeEach(async () => {
		user = await testRecords.createUser();
	});

	afterAll(async () => {
		await testFramework.end();
	});

	describe('getListsForUser', () => {
		it('Should return the lists for the user', async () => {
			const list1 = await testRecords.createList(user.id);
			const list2 = await testRecords.createList(user.id);

			const otherUser = await testRecords.createUser();
			await testRecords.createList(otherUser.id);

			const result = await datastore.getListsForUser(user.id);
			expect(result).toEqual([list1, list2]);
		});
	});

	describe('getRecentListsForUser', () => {
		it('Should return recent lists for the user', async () => {
			const [] = await Promise.all([
				testRecords.createList(user.id, {
					name: 'List 1',
					updatedAt: new Date('2022-01-01T00:00:00.000Z'),
				}),
				testRecords.createList(user.id, {
					name: 'List 2',
					updatedAt: new Date('2022-01-02T00:00:00.000Z'),
				}),
				testRecords.createList(user.id, {
					name: 'List 3',
					updatedAt: new Date('2022-01-03T00:00:00.000Z'),
				}),
				testRecords.createList(user.id, {
					name: 'List 4',
					updatedAt: new Date('2022-01-09T00:00:00.000Z'),
				}),
				testRecords.createList(user.id, {
					name: 'List 5',
					updatedAt: new Date('2022-01-08T00:00:00.000Z'),
				}),
				testRecords.createList(user.id, {
					name: 'List 6',
					updatedAt: new Date('2022-01-07T00:00:00.000Z'),
				}),
				testRecords.createList(user.id, {
					name: 'List 7',
					updatedAt: new Date('2022-01-06T00:00:00.000Z'),
				}),
				testRecords.createList(user.id, {
					name: 'List 8',
					updatedAt: new Date('2022-01-05T00:00:00.000Z'),
				}),
				testRecords.createList(user.id, {
					name: 'List 9',
					updatedAt: new Date('2022-01-04T00:00:00.000Z'),
				}),
				testRecords.createList(user.id, {
					name: 'List 10',
					updatedAt: new Date('2022-01-01T00:00:00.000Z'),
				}),
				testRecords.createList(user.id, {
					name: 'List 11',
					updatedAt: new Date('2022-01-01T00:00:00.000Z'),
				}),
			]);

			const otherUser = await testRecords.createUser();
			await testRecords.createList(otherUser.id);

			const result = await datastore.getRecentListsForUser(user.id);
			expect(result.map((x) => x.name)).toEqual([
				'List 1',
				'List 11',
				'List 2',
				'List 3',
				'List 4',
				'List 5',
				'List 6',
				'List 7',
				'List 8',
				'List 9',
			]);
		});
	});

	describe('getList', () => {
		it('Should error if the list is NOT found', async () => {
			await expect(() => datastore.getList(uuid())).rejects.toThrow(
				'List not found',
			);
		});

		it('Should return the list', async () => {
			const list = await testRecords.createList(user.id);

			const result = await datastore.getList(list.id);
			expect(result).toEqual(list);
		});
	});

	describe('createListForUser', () => {
		it('Should create the list', async () => {
			const list: CreateListProps = {
				game: 'Game',
				army: 'Army',
				groups: [],
				points: 200,
				name: 'Name',
				actualPoints: 50,
			};

			const result = await datastore.createListForUser(user.id, list);

			const records = await testFramework.database.list.findMany({
				where: { userId: user.id },
			});
			expect(records).toHaveLength(1);
			expect(records[0]).toEqual(
				expect.objectContaining({
					id: result,
					userId: user.id,
					...list,
				}),
			);
		});
	});

	describe('updateListForUser', () => {
		it('Should update the list', async () => {
			const list = await testRecords.createList(user.id);

			await datastore.updateListForUser(user.id, list.id, {
				name: 'New name',
			});

			const record = await testFramework.database.list.findUnique({
				where: { id: list.id },
			});

			expect(record!.name).toEqual('New name');
		});

		it('Should error if the list is NOT found', async () => {
			await expect(() =>
				datastore.updateListForUser(user.id, uuid(), {
					name: 'New name',
				}),
			).rejects.toThrow('List not found');
		});

		it('Should error if the list is owned by another user', async () => {
			const otherUser = await testRecords.createUser();
			const list = await testRecords.createList(otherUser.id);

			await expect(() =>
				datastore.updateListForUser(user.id, list.id, {
					name: 'New name',
				}),
			).rejects.toThrow('List not found');

			const record = await testFramework.database.list.findUnique({
				where: { id: list.id },
			});

			expect(record!.name).toEqual(list.name);
		});
	});

	describe('deleteListForUser', () => {
		it('Should mark the list as deleted when owned by the user', async () => {
			const list = await testRecords.createList(user.id);
			await datastore.deleteListForUser(user.id, list.id);

			const record = await testFramework.database.list.findUnique({
				where: { id: list.id },
			});

			expect(record!.isDeleted).toBeTruthy();
		});

		it('Should error if the list is owned by another user', async () => {
			const otherUser = await testRecords.createUser();
			const list = await testRecords.createList(otherUser.id);

			await expect(() =>
				datastore.deleteListForUser(user.id, list.id),
			).rejects.toThrow('List not found');

			const record = await testFramework.database.list.findUnique({
				where: { id: list.id },
			});

			expect(record!.isDeleted).toBeFalsy();
		});
	});
});
