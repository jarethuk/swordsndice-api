import {v4 as uuid} from 'uuid';
import {TestFramework, TestRecordHelpers} from '../helpers';
import type {GameInviteResponse} from '../types/responses/GameInviteResponse.ts';
import type {GameResponse} from '../types/responses/GameResponse.ts';
import {GameDatastore} from './GameDatastore.ts';
import type {GameEntity, ListEntity, UserEntity} from './entities';

describe('GameDatastore', () => {
	let datastore: GameDatastore;
	let testFramework: TestFramework;
	let testRecords: TestRecordHelpers;
	let user: UserEntity;
	let friend: UserEntity;

	beforeAll(async () => {
		testFramework = new TestFramework();
		await testFramework.initialise('game_datastore');

		datastore = new GameDatastore(testFramework.getTestContext());
		testRecords = new TestRecordHelpers(testFramework.getTestContext());
	});

	beforeEach(async () => {
		user = await testRecords.createUser();
		friend = await testRecords.createUser();
	});

	afterAll(async () => {
		await testFramework.end();
	});

	describe('createGameForUser', () => {
		it('Should create the game', async () => {
			const result = await datastore.createGameForUser(user.id, {
				game: 'Game',
				inviteCode: '123',
				points: 100,
			});

			const records = await testFramework.database.game.findMany();
			expect(records).toHaveLength(1);
			expect(records[0]).toEqual(
				expect.objectContaining({
					id: result,
					game: 'Game',
					inviteCode: '123',
					points: 100,
					createdByUserId: user.id,
					isComplete: false,
					isStarted: false,
				}),
			);
		});

		it('Should add the user as a member', async () => {
			const result = await datastore.createGameForUser(user.id, {
				game: 'Game',
				inviteCode: '123',
				points: 100,
			});

			const records = await testFramework.database.gameMember.findMany({
				where: { gameId: result },
			});

			expect(records).toHaveLength(1);
			expect(records[0]).toEqual(
				expect.objectContaining({
					userId: user.id,
				}),
			);
		});
	});

	describe('updateGameForUser', () => {
		it('Should error if the game does not exist', async () => {
			await expect(() =>
				datastore.updateGameForUser(user.id, uuid(), {
					points: 1,
				}),
			).rejects.toThrow('Game not found');
		});

		it('Should error if the user is NOT a member of the game', async () => {
			const { id } = await testRecords.createGame(user.id);

			await expect(() =>
				datastore.updateGameForUser(friend.id, id, {
					points: 1,
				}),
			).rejects.toThrow('Game not found');
		});

		it('Should allow a member to update the game', async () => {
			const { id } = await testRecords.createGame(user.id);

			await datastore.updateGameForUser(user.id, id, {
				points: 1,
			});

			const record = await testFramework.database.game.findUnique({
				where: { id },
			});

			expect(record!.points).toEqual(1);
		});

		describe('When the game is completed', () => {
			it('Should update the winners', async () => {
				const { id } = await testRecords.createGame(user.id);

				await testRecords.createGameMember(friend.id, id, {
					points: 5,
				});

				await datastore.updateGameForUser(user.id, id, {
					points: 3,
				});

				await datastore.updateGameForUser(user.id, id, {
					isComplete: true,
				});

				const records = await testFramework.database.gameMember.findMany({
					where: { gameId: id },
				});

				expect(records.find((x) => x.userId === user.id)?.isWinner).toBeFalsy();
				expect(
					records.find((x) => x.userId === friend.id)?.isWinner,
				).toBeTruthy();
			});
		});
	});

	describe('deleteGameForUser', () => {
		it('Should delete the game', async () => {
			const { id } = await testRecords.createGame(user.id);

			await datastore.deleteGameForUser(user.id, id);

			const records = await testFramework.database.game.findMany({
				where: { id },
			});

			expect(records).toHaveLength(0);
		});

		it('Should NOT error if the game does not exist', async () => {
			await datastore.deleteGameForUser(user.id, uuid());
		});
	});

	describe('getGame', () => {
		it('Should error if the game does not exist', async () => {
			await expect(() =>
				datastore.getGameForUser(user.id, uuid()),
			).rejects.toThrow('Game not found');
		});

		it('Should return the game for the user', async () => {
			const game = await testRecords.createGame(user.id);
			await testRecords.createGameInvite(friend.id, game.id);

			const result = await datastore.getGameForUser(user.id, game.id);

			expect(result).toEqual({
				id: game.id,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
				game: game.game,
				points: game.points,
				isComplete: game.isComplete,
				isStarted: game.isStarted,
				image: game.image,
				inviteCode: game.inviteCode,
				description: game.description,
				createdBy: {
					id: user.id,
					username: user.username,
					image: user.image,
				},
				members: [
					{
						id: expect.any(String),
						user: {
							id: user.id,
							username: user.username,
							image: user.image,
						},
						list: null,
						points: 1,
						modelCount: 3,
						modelCountRemaining: 2,
						isWinner: false,
					},
				],
				invites: [
					{
						id: friend.id,
						username: friend.username,
						image: friend.image,
					},
				],
			} as GameResponse);
		});

		it('Should NOT return invite codes for non-members', async () => {
			const game = await testRecords.createGame(user.id);

			const result = await datastore.getGameForUser(friend.id, game.id);
			expect(result.inviteCode).toBeNull();
		});
	});

	describe('inviteToGame', () => {
		let game: GameEntity;
		let gameAdminId: string;

		beforeAll(async () => {
			const admin = await testRecords.createUser();
			gameAdminId = admin.id;
		});

		beforeEach(async () => {
			game = await testRecords.createGame(gameAdminId);
		});

		it('Should error if the user is NOT a member of the game', async () => {
			await expect(() =>
				datastore.inviteToGame({
					gameId: game.id,
					userId: user.id,
					friendId: friend.id,
				}),
			).rejects.toThrow('Game not found');
		});

		it('Should NOT create an invite if they are already a member', async () => {
			await testRecords.createGameMember(user.id, game.id);

			await datastore.inviteToGame({
				gameId: game.id,
				userId: gameAdminId,
				friendId: user.id,
			});

			const records = await testFramework.database.gameInvite.findMany({
				where: { gameId: game.id },
			});

			expect(records).toHaveLength(0);
		});

		it('Should NOT create an invite if already invited', async () => {
			await testRecords.createGameInvite(user.id, game.id);

			await datastore.inviteToGame({
				gameId: game.id,
				userId: gameAdminId,
				friendId: user.id,
			});

			const records = await testFramework.database.gameInvite.findMany({
				where: { gameId: game.id },
			});

			expect(records).toHaveLength(1);
		});

		it('Should create the invite record', async () => {
			await datastore.inviteToGame({
				gameId: game.id,
				userId: gameAdminId,
				friendId: user.id,
			});

			const records = await testFramework.database.gameInvite.findMany({
				where: { gameId: game.id },
			});

			expect(records).toHaveLength(1);
			expect(records[0].userId).toEqual(user.id);
		});
	});

	describe('acceptInviteForUser', () => {
		let game: GameEntity;

		beforeEach(async () => {
			game = await testRecords.createGame(user.id);
		});

		it('Should error if the invite is NOT found for the user', async () => {
			await expect(() =>
				datastore.acceptInviteForUser(friend.id, game.id),
			).rejects.toThrow('Invite not found');
		});

		it('Should delete the invite and create the member record', async () => {
			await testRecords.createGameInvite(friend.id, game.id, user.id);
			await datastore.acceptInviteForUser(friend.id, game.id);

			const invites = await testFramework.database.gameInvite.findMany({
				where: { gameId: game.id },
			});

			expect(invites).toHaveLength(0);

			const members = await testFramework.database.gameMember.findMany({
				where: { gameId: game.id },
			});

			expect(members).toHaveLength(2);
		});
	});

	describe('joinGameByCodeForUser', () => {
		let game: GameEntity;

		beforeEach(async () => {
			game = await testRecords.createGame(user.id);
		});

		it('Should error if the game does NOT exist', async () => {
			await expect(() =>
				datastore.joinGameByCodeForUser({
					userId: friend.id,
					inviteCode: 'test',
					gameId: uuid(),
				}),
			).rejects.toThrow('Game not found');
		});

		it('Should error if the invite code is invalid', async () => {
			await expect(() =>
				datastore.joinGameByCodeForUser({
					userId: friend.id,
					inviteCode: 'test',
					gameId: game.id,
				}),
			).rejects.toThrow('Game not found');
		});

		it('Should delete invites if they exist for the user', async () => {
			await testRecords.createGameInvite(friend.id, game.id);

			await datastore.joinGameByCodeForUser({
				userId: friend.id,
				inviteCode: game.inviteCode!,
				gameId: game.id,
			});

			const records = await testFramework.database.gameInvite.findMany({
				where: { gameId: game.id },
			});

			expect(records).toHaveLength(0);
		});

		it('Should create the member record if the invite code is valid', async () => {
			await datastore.joinGameByCodeForUser({
				userId: friend.id,
				inviteCode: game.inviteCode!,
				gameId: game.id,
			});

			const records = await testFramework.database.gameMember.findMany({
				where: { gameId: game.id },
			});

			expect(records).toHaveLength(2);
		});
	});

	describe('declineInviteForUser', () => {
		it('Should delete the invite record', async () => {
			const game = await testRecords.createGame(user.id);
			await testRecords.createGameInvite(friend.id, game.id);

			await datastore.declineInviteForUser(friend.id, game.id);

			const records = await testFramework.database.gameInvite.findMany({
				where: { gameId: game.id },
			});

			expect(records).toHaveLength(0);
		});
	});

	describe('leaveGameForUser', () => {
		it('Should delete the member record', async () => {
			const game = await testRecords.createGame(user.id);
			await testRecords.createGameMember(friend.id, game.id);

			await datastore.leaveGameForUser(friend.id, game.id);

			const records = await testFramework.database.gameMember.findMany({
				where: { gameId: game.id },
			});

			expect(records).toHaveLength(1);
		});

		it('Should NOT delete the game if there are other members', async () => {
			const game = await testRecords.createGame(user.id);
			await testRecords.createGameMember(friend.id, game.id);

			await datastore.leaveGameForUser(friend.id, game.id);

			const count = await testFramework.database.game.count({
				where: { id: game.id },
			});
			expect(count).toEqual(1);
		});

		it('Should delete the game if there are no other members', async () => {
			const game = await testRecords.createGame(user.id);

			await datastore.leaveGameForUser(user.id, game.id);

			const count = await testFramework.database.game.count({
				where: { id: game.id },
			});
			expect(count).toEqual(0);
		});
	});

	describe('setGameListForUser', () => {
		it('Should error if the game does NOT exist', async () => {
			await expect(() =>
				datastore.setGameListForUser({
					userId: user.id,
					gameId: uuid(),
					list: {
						id: 'test',
						game: 'game',
					} as ListEntity,
				}),
			).rejects.toThrow('Game not found');
		});

		it('Should error if the user is NOT a member of the game', async () => {
			const game = await testRecords.createGame(user.id);
			await testRecords.createGameInvite(friend.id, game.id);

			await expect(() =>
				datastore.setGameListForUser({
					userId: friend.id,
					gameId: game.id,
					list: {
						id: 'test',
						game: 'game',
					} as ListEntity,
				}),
			).rejects.toThrow('Game not found');
		});

		it('Should set the list on the game member record for the user', async () => {
			const game = await testRecords.createGame(user.id);

			const list = {
				id: 'test',
				game: 'game',
			} as ListEntity;

			await datastore.setGameListForUser({
				userId: user.id,
				gameId: game.id,
				list,
			});

			const record = await testFramework.database.gameMember.findFirst({
				where: { gameId: game.id, userId: user.id },
			});

			expect(record!.list).toEqual(list);
		});
	});

	describe('getUserGames', () => {
		let game1: GameEntity;
		let game2: GameEntity;

		beforeEach(async () => {
			game1 = await testRecords.createGame(user.id, {
				isStarted: true,
				createdAt: new Date('2021-01-01'),
			});

			game2 = await testRecords.createGame(user.id, {
				isStarted: true,
				isComplete: true,
				createdAt: new Date('2021-01-02'),
			});
		});

		it('Should return all the games for the user', async () => {
			const result = await datastore.getUserGames(user.id);

			expect(result).toEqual([
				{
					id: game2.id,
					createdAt: game2.createdAt,
					game: game2.game,
					points: game2.points,
					members: [
						{
							id: user.id,
							username: user.username,
							image: user.image,
							army: undefined,
							isWinner: false,
						},
					],
				},
				{
					id: game1.id,
					createdAt: game1.createdAt,
					game: game1.game,
					points: game1.points,
					members: [
						{
							id: user.id,
							username: user.username,
							image: user.image,
							army: undefined,
							isWinner: false,
						},
					],
				},
			]);
		});

		it('Should return active games for the user', async () => {
			const result = await datastore.getUserGames(user.id, 'active');

			expect(result).toHaveLength(1);
			expect(result[0].id).toEqual(game1.id);
		});

		it('Should return complete games for the user', async () => {
			const result = await datastore.getUserGames(user.id, 'complete');

			expect(result).toHaveLength(1);
			expect(result[0].id).toEqual(game2.id);
		});
	});

	describe('cancelInviteToGame', () => {
		it('Should error if the game does NOT exist', async () => {
			await expect(() =>
				datastore.cancelInviteToGame({
					gameId: uuid(),
					userId: user.id,
					friendId: friend.id,
				}),
			).rejects.toThrow('Game not found');
		});

		it('Should error if the the user is NOT a member', async () => {
			await expect(() =>
				datastore.cancelInviteToGame({
					gameId: uuid(),
					userId: friend.id,
					friendId: user.id,
				}),
			).rejects.toThrow('Game not found');
		});

		it('Should NOT error if the invite is NOT found for the user', async () => {
			const game = await testRecords.createGame(user.id);

			await datastore.cancelInviteToGame({
				gameId: game.id,
				userId: user.id,
				friendId: friend.id,
			});
		});

		it('Should delete the invite record', async () => {
			const game = await testRecords.createGame(user.id);
			await testRecords.createGameInvite(friend.id, game.id);

			await datastore.cancelInviteToGame({
				gameId: game.id,
				userId: user.id,
				friendId: friend.id,
			});

			const result = await testFramework.database.gameInvite.findMany({
				where: { gameId: game.id },
			});

			expect(result).toHaveLength(0);
		});
	});

	describe('getGameInvites', () => {
		it('Should return the invites for the user', async () => {
			const game = await testRecords.createGame(user.id);
			await testRecords.createGameInvite(friend.id, game.id, user.id);

			const result = await datastore.getGameInvites(friend.id);
			expect(result).toEqual([
				{
					id: game.id,
					createdAt: game.createdAt,
					game: game.game,
					points: game.points,
					invitedBy: {
						id: user.id,
						username: user.username,
						image: user.image,
					},
				} as GameInviteResponse,
			]);
		});
	});
});
