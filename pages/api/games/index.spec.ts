import type { GameEntity, UserEntity } from '../../../datastores/entities';
import { TestRecordHelpers } from '../../../helpers';
import { NextTestHelper } from '../../../modules';
import type { CreateGameRequest } from '../../../types/requests/CreateGameRequest.ts';
import handler from './index.page';

describe('/games', () => {
	const url = '/api/games';

	const test = new NextTestHelper();
	let testRecordHelpers: TestRecordHelpers;
	let user: UserEntity;
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
		game = await testRecordHelpers.createGame(user.id);
	});

	describe('GET /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'GET',
		});

		it('Should return a list of games for the user', async () => {
			const { body } = await test.get({
				handler,
				url,
				user,
			});

			expect(body).toEqual([
				{
					id: game.id,
					createdAt: game.createdAt.toISOString(),
					game: game.game,
					points: game.points,
					members: [
						{
							id: user.id,
							username: user.username,
							image: user.image,
							isWinner: false,
						},
					],
				},
			]);
		});
	});

	describe('PUT /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'PUT',
		});

		it('Should create a game and return the id', async () => {
			const data = {
				game: 'game',
				inviteCode: 'inviteCode',
				description: 'description',
				image: 'image',
				points: 100,
			} as CreateGameRequest;

			const { body } = await test.put({
				handler,
				url,
				user,
				data,
			});

			expect(body).toEqual({
				id: expect.any(String),
			});

			const record = await test.database.game.findFirst({
				where: { id: body.id },
			});
			expect(record).toEqual(expect.objectContaining(data));
		});
	});
});
