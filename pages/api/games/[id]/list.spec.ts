import { v4 as uuid } from 'uuid';
import type { GameEntity, UserEntity } from '../../../../datastores/entities';
import { MockListBody, TestRecordHelpers } from '../../../../helpers';
import { NextTestHelper } from '../../../../modules';
import handler from './list.page';

describe('/games/[id]/list', () => {
	const url = '/api/games/[id]/list';

	const test = new NextTestHelper();
	let testRecordHelpers: TestRecordHelpers;
	let user: UserEntity;
	let invitedUser: UserEntity;
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
		invitedUser = await testRecordHelpers.createUser();

		game = await testRecordHelpers.createGame(user.id);
		await testRecordHelpers.createGameInvite(invitedUser.id, game.id);

		await test.database.gameMember.updateMany({
			where: { gameId: game.id, userId: user.id },
			data: {
				list: MockListBody as any,
			},
		});
	});

	describe('PATCH /', () => {
		const mockUpdate = {
			...MockListBody,
			image: 'new image',
		};

		test.checkAuthorised({
			handler,
			url,
			method: 'PATCH',
			parameters: {
				id: uuid(),
			},
		});

		it('Should error if the game does not exist', async () => {
			await expect(() =>
				test.patch({
					handler,
					url,
					user,
					parameters: {
						id: uuid(),
					},
					data: mockUpdate,
				}),
			).rejects.toThrow('Game not found');
		});

		it('Should error if the user is NOT a member', async () => {
			await expect(() =>
				test.patch({
					handler,
					url,
					user: invitedUser,
					parameters: {
						id: game.id,
					},
					data: mockUpdate,
				}),
			).rejects.toThrow('Game not found');
		});

		it('Should update the list on the game for the member', async () => {
			const { body } = await test.patch({
				handler,
				url,
				user,
				parameters: {
					id: game.id,
				},
				data: mockUpdate,
			});

			expect(body).toEqual({
				success: true,
			});

			const record = await test.database.gameMember.findFirst({
				where: { gameId: game.id, userId: user.id },
			});

			expect(record?.list).toEqual(expect.objectContaining(mockUpdate));
		});
	});

	describe('DELETE /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'DELETE',
			parameters: {
				id: uuid(),
			},
		});

		it('Should error if the game does not exist', async () => {
			await expect(() =>
				test.delete({
					handler,
					url,
					user,
					parameters: {
						id: uuid(),
					},
				}),
			).rejects.toThrow('Game not found');
		});

		it('Should error if the user is NOT a member', async () => {
			await expect(() =>
				test.delete({
					handler,
					url,
					user: invitedUser,
					parameters: {
						id: game.id,
					},
				}),
			).rejects.toThrow('Game not found');
		});

		it('Should remove the list on the game for the member', async () => {
			const { body } = await test.delete({
				handler,
				url,
				user,
				parameters: {
					id: game.id,
				},
			});

			expect(body).toEqual({
				success: true,
			});

			const record = await test.database.gameMember.findFirst({
				where: { gameId: game.id, userId: user.id },
			});

			expect(record?.list).toBeNull();
		});
	});
});
