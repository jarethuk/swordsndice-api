import { v4 as uuid } from 'uuid';
import type { ListEntity, UserEntity } from '../../../../datastores/entities';
import { TestRecordHelpers } from '../../../../helpers';
import { NextTestHelper } from '../../../../modules';
import type { ListBody } from '../../../../types/ListBody.ts';
import handler from './index.page';

describe('/list/[id]', () => {
	const url = '/api/list/[id]';

	const test = new NextTestHelper();
	let testRecordHelpers: TestRecordHelpers;
	let user: UserEntity;

	let list: ListEntity;

	beforeAll(async () => {
		const context = await test.initialise(url);
		testRecordHelpers = new TestRecordHelpers(context);
	});

	afterAll(async () => {
		await test.end();
	});

	beforeEach(async () => {
		user = await testRecordHelpers.createUser();
		list = await testRecordHelpers.createList(user.id);
	});

	describe('GET /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'GET',
			parameters: { id: uuid() },
		});

		it('Should error if the list does not exist', async () => {
			await expect(() =>
				test.get({
					handler,
					url,
					user,
					parameters: { id: uuid() },
				}),
			).rejects.toThrow('List not found');
		});

		it('Should return a list owned by the user', async () => {
			const { body } = await test.get({
				handler,
				url,
				user,
				parameters: { id: list.id },
			});

			expect(body).toEqual({
				id: list.id,
				name: list.name,
				army: list.army,
				points: list.points,
				actualPoints: list.actualPoints,
				groups: list.groups,
				game: list.game,
				description: list.description,
				image: list.image,
				isDeleted: list.isDeleted,
			});
		});
	});

	describe('PATCH', () => {
		const data: ListBody = {
			name: 'New list name',
			army: 'Army',
			points: 100,
			game: 'Game',
			groups: [],
			actualPoints: 1,
		};

		test.checkAuthorised({
			handler,
			url,
			method: 'PATCH',
			parameters: { id: uuid() },
			data,
		});

		it('Should error if the list does not exist', async () => {
			await expect(() =>
				test.patch({
					handler,
					url,
					user,
					parameters: { id: uuid() },
					data,
				}),
			).rejects.toThrow('List not found');
		});

		it('Should error if the list is owned by another user', async () => {
			const otherUser = await testRecordHelpers.createUser();
			const otherList = await testRecordHelpers.createList(otherUser.id);

			await expect(() =>
				test.patch({
					handler,
					url,
					user,
					parameters: { id: otherList.id },
					data,
				}),
			).rejects.toThrow('List not found');
		});

		it('Should update the list', async () => {
			const { body } = await test.patch({
				handler,
				url,
				user,
				data,
				parameters: { id: list.id },
			});

			expect(body).toEqual({
				success: true,
			});

			const record = await test.database.list.findFirst({
				where: { id: body.id, userId: user.id },
			});

			expect(record).toEqual(expect.objectContaining(data));
		});
	});

	describe('DELETE', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'DELETE',
			parameters: { id: uuid() },
		});

		it('Should error if the list does not exist', async () => {
			await expect(() =>
				test.delete({
					handler,
					url,
					user,
					parameters: { id: uuid() },
				}),
			).rejects.toThrow('List not found');
		});

		it('Should error if the list is owned by another user', async () => {
			const otherUser = await testRecordHelpers.createUser();
			const otherList = await testRecordHelpers.createList(otherUser.id);

			await expect(() =>
				test.delete({
					handler,
					url,
					user,
					parameters: { id: otherList.id },
				}),
			).rejects.toThrow('List not found');
		});

		it('Should update the list to be deleted', async () => {
			const { body } = await test.delete({
				handler,
				url,
				user,
				parameters: { id: list.id },
			});

			expect(body).toEqual({
				success: true,
			});

			const record = await test.database.list.findFirst({
				where: { id: body.id, userId: user.id },
			});

			expect(record?.isDeleted).toBeTruthy();
		});
	});
});
