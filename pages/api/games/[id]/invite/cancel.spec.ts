import {v4 as uuid} from 'uuid';
import handler from './cancel.page';
import type {GameEntity, UserEntity,} from '../../../../../datastores/entities';
import {NextTestHelper} from '../../../../../modules';
import {TestRecordHelpers} from '../../../../../helpers';
import type {InviteUserToGameRequest} from '../../../../../types/requests/InviteUserToGameRequest.ts';

describe('/games/[id]/invites/cancel', () => {
	const url = '/api/games/[id]/invites/cancel';

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

	describe('PATCH /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'PATCH',
			data: {
				friendId: uuid(),
			},
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
					data: {
						friendId: uuid(),
					} as InviteUserToGameRequest,
					parameters: {
						id: uuid(),
					},
				}),
			).rejects.toThrow('Game not found');
		});

		it('Should error if the user is NOT a member of the game', async () => {
			await expect(() =>
				test.patch({
					handler,
					url,
					user: friend,
					data: {
						friendId: uuid(),
					} as InviteUserToGameRequest,
					parameters: {
						id: uuid(),
					},
				}),
			).rejects.toThrow('Game not found');
		});

		it('Should delete an invite for the user to the game', async () => {
			await testRecordHelpers.createGameInvite(friend.id, game.id);

			const { body } = await test.patch({
				handler,
				url,
				user,
				data: {
					friendId: friend.id,
				} as InviteUserToGameRequest,
				parameters: {
					id: game.id,
				},
			});

			expect(body).toEqual({
				success: true,
			});

			const record = await test.database.gameInvite.findFirst({
				where: {
					userId: friend.id,
					gameId: game.id,
				},
			});

			expect(record).toBeNull();
		});
	});
});
