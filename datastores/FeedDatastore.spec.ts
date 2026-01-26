import {TestFramework, TestRecordHelpers} from '../helpers';
import {FeedDatastore} from './FeedDatastore.ts';
import type {UserEntity} from './entities';

describe('FeedDatastore', () => {
	let datastore: FeedDatastore;
	let testFramework: TestFramework;
	let testRecords: TestRecordHelpers;
	let user: UserEntity;
	let friend: UserEntity;
	let otherUser: UserEntity;

	beforeAll(async () => {
		testFramework = new TestFramework();
		await testFramework.initialise('feed_datastore');

		datastore = new FeedDatastore(testFramework.getTestContext());
		testRecords = new TestRecordHelpers(testFramework.getTestContext());
	});

	beforeEach(async () => {
		await testFramework.database.user.deleteMany({});

		user = await testRecords.createUser({
			username: 'Me',
		});

		friend = await testRecords.createUser({
			username: 'Friend',
		});

		otherUser = await testRecords.createUser({
			username: 'Other User',
		});

		await testRecords.createFriend(user.id, friend.id);
		await testRecords.createFriend(friend.id, otherUser.id);

		// User -> Friend -> OtherUser
	});

	afterAll(async () => {
		await testFramework.end();
	});

	describe('getFriendsGames', () => {
		it('Should return games friends have played that the user was NOT in', async () => {
			const friendGame = await testRecords.createGame(friend.id, {
				description: 'Friend game',
				isStarted: true,
			});
			await testRecords.createGameMember(otherUser.id, friendGame.id);

			const completedFriendGame = await testRecords.createGame(friend.id, {
				description: 'Completed friend game',
				isStarted: true,
				isComplete: true,
				createdAt: new Date('2021-01-02'),
			});
			await testRecords.createGameMember(otherUser.id, completedFriendGame.id, {
				points: 5,
			});

			await testRecords.createGame(user.id, {
				description: 'My game',
				isStarted: true,
				createdAt: new Date('2021-01-01'),
			});

			const myGameWithFriend = await testRecords.createGame(user.id, {
				description: 'My game with friend',
				isStarted: true,
			});
			await testRecords.createGameMember(friend.id, myGameWithFriend.id, {
				points: 5,
			});

			const result = await datastore.getFriendsGames(user.id, [friend.id]);

			expect(result).toHaveLength(2);

			expect(result).toEqual([
				{
					id: completedFriendGame.id,
					subTitle: 'Winner: @Other User',
					title: '@Friend completed a Test Game of 500pts',
					type: 'Game Completed',
					date: expect.any(Date),
				},
				{
					id: friendGame.id,
					title: '@Friend started a Test Game of 500pts',
					type: 'Game Started',
					date: expect.any(Date),
				},
			]);
		});
	});

	describe('getGroupsJoinedForFriends', () => {
		it('Should return groups joined by friends', async () => {
			const friendCreatedGroup = await testRecords.createGroup(friend.id, {
				name: 'Created Group',
			});

			await testRecords.createGroup(friend.id, {
				name: 'Private Group',
				isPublic: false,
			});

			const otherUserGroup = await testRecords.createGroup(otherUser.id, {
				name: 'Joined Group',
			});

			await testRecords.createGroupMember(friend.id, otherUserGroup.id);

			const result = await datastore.getGroupsJoinedForFriends([friend.id]);

			expect(result).toEqual([
				{
					date: expect.any(Date),
					id: otherUserGroup.id,
					image: otherUserGroup.image,
					title: '@Friend joined the Joined Group group',
					type: 'Group Joined',
				},
				{
					date: expect.any(Date),
					id: friendCreatedGroup.id,
					image: friendCreatedGroup.image,
					title: '@Friend created the Created Group group',
					type: 'Group Created',
				},
			]);
		});
	});

	describe('getFriendsAddedFriends', () => {
		it('Should return friends added by friends', async () => {
			const result = await datastore.getFriendsAddedFriends(user.id, [
				friend.id,
			]);

			expect(result).toEqual([
				{
					date: expect.any(Date),
					id: otherUser.id,
					title: '@Friend added @Other User as a friend',
					type: 'Friend Added',
				},
			]);
		});
	});
});
