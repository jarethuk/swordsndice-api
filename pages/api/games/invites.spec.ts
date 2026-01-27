import type { GameEntity, UserEntity } from '../../../datastores/entities';
import { TestRecordHelpers } from '../../../helpers';
import { NextTestHelper } from '../../../modules';
import handler from './invites.page';

describe('/games/invites', () => {
	const url = '/api/games/invites';

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

	describe('GET /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'GET',
		});

		it('Should return a list of game invites for the user', async () => {
			await testRecordHelpers.createGameInvite(friend.id, game.id, user.id);

			const { body } = await test.get({
				handler,
				url,
				user: friend,
			});

			expect(body).toEqual([
				{
					id: game.id,
					createdAt: game.createdAt.toISOString(),
					game: game.game,
					points: game.points,
					invitedBy: {
						id: user.id,
						username: user.username,
						image: user.image,
					},
				},
			]);
		});
	});
});
