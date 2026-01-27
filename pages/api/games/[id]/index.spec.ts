import { v4 as uuid } from 'uuid';
import type { GameEntity, UserEntity } from '../../../../datastores/entities';
import { MockListBody, TestRecordHelpers } from '../../../../helpers';
import { NextTestHelper } from '../../../../modules';
import type { UpdateGameRequest } from '../../../../types/requests/UpdateGameRequest.ts';
import handler from './index.page';

describe('/games/[id]', () => {
	const url = '/api/games/[id]';

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
				list: MockListBody,
			},
		});
	});

	describe('GET /', () => {
		function getExpectedGame() {
			return {
				id: game.id,
				createdAt: game.createdAt.toISOString(),
				updatedAt: game.updatedAt.toISOString(),
				game: game.game,
				points: game.points,
				createdBy: {
					id: user.id,
					username: user.username,
					image: user.image,
				},
				image: game.image,
				description: game.description,
				isComplete: game.isComplete,
				isStarted: game.isStarted,
				inviteCode: null,
				members: [
					{
						user: {
							id: user.id,
							username: user.username,
							image: user.image,
						},
						list: MockListBody,
						points: 0,
						isWinner: false,
					},
				],
				invites: [
					{
						id: invitedUser.id,
						username: invitedUser.username,
						image: invitedUser.image,
					},
				],
			};
		}

		test.checkAuthorised({
			handler,
			url,
			method: 'GET',
			parameters: {
				id: uuid(),
			},
		});

		it('Should error if the game does not exist', async () => {
			await expect(() =>
				test.get({
					handler,
					url,
					user,
					parameters: {
						id: uuid(),
					},
				}),
			).rejects.toThrow('Game not found');
		});

		it('Should return the game without an invite code if NOT a member', async () => {
			const { body } = await test.get({
				handler,
				url,
				user: invitedUser,
				parameters: {
					id: game.id,
				},
			});

			expect(body).toEqual(getExpectedGame());
		});

		it('Should return a game for the user', async () => {
			const { body } = await test.get({
				handler,
				url,
				user,
				parameters: {
					id: game.id,
				},
			});

			expect(body).toEqual({
				...getExpectedGame(),
				inviteCode: game.inviteCode,
			});
		});
	});

	describe('PATCH /', () => {
		const mockUpdate: UpdateGameRequest = {
			description: 'new description',
			image: 'new image',
			points: 100,
			isComplete: true,
			isStarted: true,
		};

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

		it('Should allow a member to update the game', async () => {
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

			const record = await test.database.game.findFirst({
				where: { id: game.id },
			});

			expect(record).toEqual(expect.objectContaining(mockUpdate));
		});
	});

	describe('DELETE /', () => {
		it('Should return true if the game does not exist', async () => {
			const { body } = await test.delete({
				handler,
				url,
				user,
				parameters: {
					id: uuid(),
				},
			});

			expect(body).toEqual({
				success: true,
			});
		});

		it('Should return true if the user is NOT a member of the game and NOT delete', async () => {
			const { body } = await test.delete({
				handler,
				url,
				user: invitedUser,
				parameters: {
					id: game.id,
				},
			});

			expect(body).toEqual({
				success: true,
			});

			const record = await test.database.game.findFirst({
				where: { id: game.id },
			});

			expect(record).toBeDefined();
		});

		it('Should allow a member to delete the game', async () => {
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

			const record = await test.database.game.findFirst({
				where: { id: game.id },
			});

			expect(record).toBeNull();
		});
	});
});
