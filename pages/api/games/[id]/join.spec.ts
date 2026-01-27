import { v4 as uuid } from 'uuid';
import type { GameEntity, UserEntity } from '../../../../datastores/entities';
import { TestRecordHelpers } from '../../../../helpers';
import { NextTestHelper } from '../../../../modules';
import handler from './join.page';

describe('/games/[id]/join', () => {
	const url = '/api/games/[id]/join';

	const test = new NextTestHelper();
	let testRecordHelpers: TestRecordHelpers;
	let user: UserEntity;
	let friend: UserEntity;
	let game: GameEntity;

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
		game = await testRecordHelpers.createGame(user.id);
	});

	describe('PUT /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'PUT',
			parameters: {
				id: uuid(),
			},
		});

		it('Should error if the game does not exist', async () => {
			await expect(() =>
				test.put({
					handler,
					url,
					user,
					parameters: {
						id: uuid(),
					},
					data: {
						inviteCode: 'TEST',
					},
				}),
			).rejects.toThrow('Game not found');
		});

		it('Should error if the invite code is wrong', async () => {
			await expect(() =>
				test.put({
					handler,
					url,
					user: friend,
					parameters: {
						id: game.id,
					},
					data: {
						inviteCode: 'TEST',
					},
				}),
			).rejects.toThrow('Game not found');
		});

		it('Should add the user as a member', async () => {
			const { body } = await test.put({
				handler,
				url,
				user,
				parameters: {
					id: game.id,
				},
				data: {
					inviteCode: game.inviteCode,
				},
			});

			expect(body).toEqual({
				success: true,
			});

			const record = await test.database.gameMember.findFirst({
				where: { gameId: game.id, userId: user.id },
			});

			expect(record).toBeDefined();
		});
	});
});
