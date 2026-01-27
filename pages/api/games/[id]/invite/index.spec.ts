import { v4 as uuid } from 'uuid';
import type {
	GameEntity,
	UserEntity,
} from '../../../../../datastores/entities';
import { TestRecordHelpers } from '../../../../../helpers';
import { NextTestHelper } from '../../../../../modules';
import type { InviteUserToGameRequest } from '../../../../../types/requests/InviteUserToGameRequest.ts';
import handler from './index.page';

describe('/games/[id]/invites', () => {
	const url = '/api/games/[id]/invites';

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
			data: {
				friendId: uuid(),
			},
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
				test.put({
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

		it('Should create an invite for the user to the game', async () => {
			const { body } = await test.put({
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

			expect(record).toBeDefined();
		});
	});
});
