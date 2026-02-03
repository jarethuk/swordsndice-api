import type { UserEntity } from '../../../datastores/entities';
import { TestRecordHelpers } from '../../../helpers';
import { NextTestHelper, ValidationHelpers } from '../../../modules';
import { ListBody } from '../../../types/ListBody.ts';
import type { PublicUser } from '../../../types/responses/PublicUser.ts';
import handler from './[username].page';

describe('/user/[username]', () => {
	const url = '/api/user[username]';

	const test = new NextTestHelper();
	let testRecordHelpers: TestRecordHelpers;
	let user: UserEntity;
	let otherUser: UserEntity;

	beforeAll(async () => {
		const context = await test.initialise(url);
		testRecordHelpers = new TestRecordHelpers(context);
	});

	afterAll(async () => {
		await test.end();
	});

	beforeEach(async () => {
		user = await testRecordHelpers.createUser();
		otherUser = await testRecordHelpers.createUser();
	});

	describe('GET /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'GET',
			parameters: {
				username: 'test',
			},
		});

		it('Should return false if the username does NOT exist', async () => {
			const { body } = await test.get({
				handler,
				url,
				user,
				parameters: {
					username: 'bob',
				},
			});

			expect(body).toBeFalsy();
		});

		it('Should get the user by username', async () => {
			const { body } = await test.get({
				handler,
				url,
				user,
				parameters: {
					username: otherUser.username,
				},
			});

			expect(body).toEqual({
				id: otherUser.id,
				username: otherUser.username,
				image: otherUser.image,
				isFriend: false,
				description: otherUser.description,
				lists: [],
				games: [],
			} as PublicUser);
		});

		it('Should return true when the user is a friend', async () => {
			const otherUser = await testRecordHelpers.createUser();
			await testRecordHelpers.createFriend(user.id, otherUser.id);

			const { body } = await test.get({
				handler,
				url,
				user,
				parameters: {
					username: otherUser.username,
				},
			});

			expect(body).toEqual({
				id: otherUser.id,
				username: otherUser.username,
				image: otherUser.image,
				isFriend: true,
				description: otherUser.description,
				lists: [],
				games: [],
			} as PublicUser);
		});

		it('Should return recent lists for the user', async () => {
			const list1 = await testRecordHelpers.createList(otherUser.id);
			const list2 = await testRecordHelpers.createList(otherUser.id);

			const { body } = await test.get({
				handler,
				url,
				user,
				parameters: {
					username: otherUser.username,
				},
			});

			const validator = new ValidationHelpers(test.getTestContext());

			expect(body.lists).toEqual([
				validator.validate(ListBody, list2),
				validator.validate(ListBody, list1),
			]);
		});

		it('Should return recent completed games for the user', async () => {
			const completeGame = await testRecordHelpers.createGame(otherUser.id, {
				isComplete: true,
			});

			await testRecordHelpers.createGame(otherUser.id, {
				isComplete: false,
			});

			const { body } = await test.get({
				handler,
				url,
				user,
				parameters: {
					username: otherUser.username,
				},
			});

			expect(body.games).toHaveLength(1);
			expect(body.games[0]).toEqual({
				createdAt: completeGame.createdAt.toISOString(),
				game: completeGame.game,
				id: completeGame.id,
				members: [
					{
						id: otherUser.id,
						image: otherUser.image,
						isWinner: false,
						username: otherUser.username,
					},
				],
				points: completeGame.points,
			});
		});
	});
});
