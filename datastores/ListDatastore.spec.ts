import {v4 as uuid} from 'uuid';
import {TestFramework, TestRecordHelpers} from '../helpers';
import {type CreateListProps, ListDatastore} from './ListDatastore.ts';
import type {UserEntity} from './entities';

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
