import dayjs from 'dayjs';
import {v4 as uuid} from 'uuid';
import {TestFramework, TestRecordHelpers} from '../helpers';
import {UserDatastore} from './UserDatastore';

describe('UserDatastore', () => {
	let datastore: UserDatastore;
	let testFramework: TestFramework;
	let testRecords: TestRecordHelpers;

	beforeAll(async () => {
		testFramework = new TestFramework();
		await testFramework.initialise('user_datastore');

		datastore = new UserDatastore(testFramework.getTestContext());
		testRecords = new TestRecordHelpers(testFramework.getTestContext());
	});

	afterAll(async () => {
		await testFramework.end();
	});

	describe('createUser', () => {
		it('Should create the user', async () => {
			const result = await datastore.createUser({
				email: 'test@test.com',
			});

			const records = await testFramework.database.user.findMany();
			expect(records).toHaveLength(1);
			expect(records[0]).toEqual(
				expect.objectContaining({
					id: result,
					email: 'test@test.com',
				}),
			);
		});
	});

	describe('getUserByEmail', () => {
		it('Should return the user when they exist', async () => {
			const user = await testRecords.createUser();

			const result = await datastore.getUserByEmail(user.email);
			expect(result).toEqual(user);
		});

		it('Should return null when they do not exist', async () => {
			const result = await datastore.getUserByEmail('random');
			expect(result).toBeNull();
		});
	});

	describe('getUserByUsername', () => {
		it('Should return the user when they exist', async () => {
			const user = await testRecords.createUser();

			const result = await datastore.getUserByUsername(user.username as string);
			expect(result).toEqual(user);
		});

		it('Should return null when they do not exist', async () => {
			const result = await datastore.getUserByUsername('random');
			expect(result).toBeNull();
		});
	});

	describe('getUserById', () => {
		it('Should return the user when they exist', async () => {
			const user = await testRecords.createUser();

			const result = await datastore.getUserById(user.id);
			expect(result).toEqual(user);
		});

		it('Should return null when they do not exist', async () => {
			const result = await datastore.getUserById(uuid());
			expect(result).toBeNull();
		});
	});

	describe('updateUser', () => {
		it('Should update the user', async () => {
			const user = await testRecords.createUser();

			await datastore.updateUser(user.id, {
				email: 'updated',
			});

			const result = await datastore.getUserById(user.id);
			expect(result?.email).toEqual('updated');
		});
	});

	describe('createUserLogin', () => {
		it('Should create the record and return the code', async () => {
			const email = uuid() + '@test.com';

			const result = await datastore.createUserLoginToken(email);
			expect(result).toBeDefined();

			const records = await testFramework.database.userLogin.findMany({
				where: { email },
			});
			expect(records).toHaveLength(1);
			expect(records[0].email).toEqual(email);
			expect(records[0].code).toEqual(result);
		});
	});

	describe('clearTokens', () => {
		beforeEach(async () => {
			await testFramework.database.userLogin.deleteMany();
		});

		it('Should delete expired tokens', async () => {
			await testRecords.createUserLogin('not expired');
			await testRecords.createUserLogin('expired', {
				createdAt: dayjs().subtract(10, 'minutes').toDate(),
			});

			await datastore.clearTokens();

			const records = await testFramework.database.userLogin.findMany();
			expect(records).toHaveLength(1);
			expect(records[0].email).toEqual('not expired');
		});
	});

	describe('useLoginToken', () => {
		it('Should error if the token does NOT exist', async () => {
			await expect(() =>
				datastore.useLoginToken({
					email: 'test',
					code: '123456',
				}),
			).rejects.toThrow('Invalid code');
		});

		it('Should error if the token has expired', async () => {
			const { id } = await testRecords.createUserLogin('expired', {
				createdAt: dayjs().subtract(10, 'minutes').toDate(),
				code: '123456',
			});

			await expect(() =>
				datastore.useLoginToken({
					email: 'expired',
					code: '123456',
				}),
			).rejects.toThrow('Code expired');
		});

		it('Should delete the token when successful', async () => {
			await testRecords.createUserLogin('valid', {
				code: '123456',
			});

			await datastore.useLoginToken({
				email: 'valid',
				code: '123456',
			});

			const records = await testFramework.database.userLogin.findMany({
				where: { email: 'valid' },
			});
			expect(records).toHaveLength(0);
		});
	});

	describe('findFriend', () => {
		it('Should list users which include the phrase in their username', async () => {
			const user1 = await testRecords.createUser({
				username: 'Test 1',
			});

			const user2 = await testRecords.createUser({
				username: 'Test 2',
			});

			await testRecords.createUser({
				username: 'Something',
			});

			const result = await datastore.findFriend('tes');
			expect(result).toEqual([
				{
					id: user1.id,
					username: user1.username,
					image: user1.image,
				},
				{
					id: user2.id,
					username: user2.username,
					image: user2.image,
				},
			]);
		});
	});
});
