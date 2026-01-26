import {FriendDatastore} from './FriendDatastore.ts';
import {TestFramework, TestRecordHelpers} from '../helpers';
import type {UserEntity} from './entities';

describe('FriendDatastore', () => {
	let datastore: FriendDatastore;
	let testFramework: TestFramework;
	let testRecords: TestRecordHelpers;
	let user: UserEntity;
	let friend: UserEntity;

	beforeAll(async () => {
		testFramework = new TestFramework();
		await testFramework.initialise('friend_datastore');

		datastore = new FriendDatastore(testFramework.getTestContext());
		testRecords = new TestRecordHelpers(testFramework.getTestContext());
	});

	beforeEach(async () => {
		user = await testRecords.createUser();
		friend = await testRecords.createUser();
	});

	afterAll(async () => {
		await testFramework.end();
	});

	describe('addFriendForUser', () => {
		it('Should add the friend when the user is NOT already friends', async () => {
			await datastore.addFriendForUser(user.id, friend.id);

			expect(await datastore.getFriendsForUser(user.id)).toHaveLength(1);
		});

		it('Should just return when they are already friends', async () => {
			await datastore.addFriendForUser(user.id, friend.id);
			await datastore.addFriendForUser(user.id, friend.id);

			expect(await datastore.getFriendsForUser(user.id)).toHaveLength(1);
		});
	});

	describe('removeFriendForUser', () => {
		it('Should remove the friend when the user is friends', async () => {
			await datastore.addFriendForUser(user.id, friend.id);
			await datastore.removeFriendForUser(user.id, friend.id);

			expect(await datastore.getFriendsForUser(user.id)).toHaveLength(0);
		});

		it('Should NOT error if the user is NOT friends', async () => {
			await datastore.removeFriendForUser(user.id, friend.id);
		});
	});

	describe('getFriendsForUser', () => {
		it('Should return the friends for the user', async () => {
			const userWithoutUsernames = await testRecords.createUser({
				username: null,
			});

			await datastore.addFriendForUser(user.id, friend.id);
			await datastore.addFriendForUser(user.id, userWithoutUsernames.id);

			expect(await datastore.getFriendsForUser(user.id)).toHaveLength(1);
		});
	});
});
