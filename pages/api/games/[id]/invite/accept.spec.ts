import {v4 as uuid} from 'uuid';
import type {GameEntity, UserEntity,} from '../../../../../datastores/entities';
import {TestRecordHelpers} from '../../../../../helpers';
import {NextTestHelper} from '../../../../../modules';
import type {InviteUserToGameRequest} from '../../../../../types/requests/InviteUserToGameRequest.ts';
import handler from './accept.page';

describe('/games/[id]/invites/accept', () => {
	const url = '/api/games/[id]/invites/accept';

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
			).rejects.toThrow('Invite not found');
		});

		it('Should error if the user is NOT invited', async () => {
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
			).rejects.toThrow('Invite not found');
		});

		it('Should delete an invite for the user to the game and add them as a member', async () => {
			await testRecordHelpers.createGameInvite(friend.id, game.id);

			const { body } = await test.patch({
				handler,
				url,
				user: friend,
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

			const member = await test.database.gameMember.findFirst({
				where: {
					userId: friend.id,
					gameId: game.id,
				},
			});

			expect(record).toBeDefined();
		});
	});
});
