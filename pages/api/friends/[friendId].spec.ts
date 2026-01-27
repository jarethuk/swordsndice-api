import { v4 as uuid } from 'uuid';
import type { UserEntity } from '../../../datastores/entities';
import { TestRecordHelpers } from '../../../helpers';
import { NextTestHelper } from '../../../modules';
import handler from './[friendId].page';

describe('/friends/[friendId]', () => {
	const url = '/api/friends/[friendId]';

	const test = new NextTestHelper();
	let testRecordHelpers: TestRecordHelpers;
	let user: UserEntity;
	let friend: UserEntity;

	beforeAll(async () => {
		const context = await test.initialise(url);
		testRecordHelpers = new TestRecordHelpers(context);
	});

	afterAll(async () => {
		await test.end();
	});

	beforeEach(async () => {
		user = await testRecordHelpers.createUser();
		friend = await testRecordHelpers.createUser();
	});

	describe('PUT /:friendId', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'PUT',
			parameters: {
				friendId: uuid(),
			},
		});

		it('Should error if the friend does not exist', async () => {
			await expect(() =>
				test.put({
					handler,
					url,
					user,
					parameters: {
						friendId: uuid(),
					},
				}),
			).rejects.toThrow('User not found');
		});

		it('Should add the friend to the user', async () => {
			const { body } = await test.put({
				handler,
				url,
				user,
				parameters: {
					friendId: friend.id,
				},
			});

			expect(body).toEqual(true);

			const friends = await test.database.friend.findMany({
				where: { userId: user.id },
			});
			expect(friends).toHaveLength(1);
		});
	});

	describe('DELETE /:friendId', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'DELETE',
			parameters: {
				friendId: uuid(),
			},
		});

		it('Should NOT error if the friend does not exist', async () => {
			await test.delete({
				handler,
				url,
				user,
				parameters: {
					friendId: uuid(),
				},
			});
		});

		it('Should remove the friend from the user', async () => {
			const { body } = await test.delete({
				handler,
				url,
				user,
				parameters: {
					friendId: friend.id,
				},
			});

			expect(body).toEqual(true);

			const friends = await test.database.friend.findMany({
				where: { userId: user.id },
			});
			expect(friends).toHaveLength(0);
		});
	});
});
