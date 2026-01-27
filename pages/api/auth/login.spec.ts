import { TestRecordHelpers } from '../../../helpers/TestRecordHelpers.ts';
import { EmailManager } from '../../../modules/EmailManager.ts';
import { NextTestHelper } from '../../../modules/NextTestHelper';
import handler from './login.page';

jest.mock('../../../modules/EmailManager');

describe('/auth/login', () => {
	const url = '/api/auth/login';
	const test = new NextTestHelper();
	const email = 'test@test.com';

	let testRecords: TestRecordHelpers;

	beforeAll(async () => {
		const context = await test.initialise(url);
		testRecords = new TestRecordHelpers(context);
	});

	afterAll(async () => {
		await test.end();
	});

	beforeEach(async () => {
		await test.database.user.deleteMany();
		await test.database.userLogin.deleteMany();
	});

	it('Should error if the email address is NOT valid', async () => {
		let error: Error | undefined;

		try {
			await test.put({
				handler,
				url,
				data: {
					email: 'notanemail',
				},
			});
		} catch (e) {
			error = e as Error;
		}

		if (!error?.message.includes('Invalid email address')) {
			throw new Error(
				'Expected error message to include "Invalid email address"',
			);
		}
	});

	describe('When there is no code in the request', () => {
		let emailSpy: jest.SpyInstance;

		beforeEach(async () => {
			emailSpy = jest.spyOn(EmailManager.prototype, 'sendLoginEmail');

			const { body } = await test.put({
				handler,
				url,
				data: {
					email,
				},
			});

			expect(body).toEqual({
				success: true,
			});
		});

		it('Should create a user login record', async () => {
			const records = await test.database.userLogin.findMany();
			expect(records).toHaveLength(1);
			expect(records[0].email).toEqual(email);
		});

		it('Should send an email to the user', async () => {
			const record = await test.database.userLogin.findFirst();

			expect(emailSpy).toHaveBeenCalledWith({
				email,
				code: record?.code ?? '',
			});
		});
	});

	describe('When there is a code in the request', () => {
		let emailSpy: jest.SpyInstance;

		beforeEach(async () => {
			emailSpy = jest.spyOn(EmailManager.prototype, 'sendLoginEmail');
		});

		it('Should error if the code is NOT found', async () => {
			await expect(() =>
				test.put({
					handler,
					url,
					data: {
						email,
						code: '123456',
					},
				}),
			).rejects.toThrow('Invalid code');
		});

		it('Should error if the code is expired', async () => {
			const { code } = await testRecords.createUserLogin(email, {
				createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
			});

			await expect(() =>
				test.put({
					handler,
					url,
					data: {
						email,
						code,
					},
				}),
			).rejects.toThrow('Code expired');
		});

		describe('When the code is valid', () => {
			let code: string;

			beforeEach(async () => {
				const record = await testRecords.createUserLogin(email);
				code = record.code;
			});

			it('Should delete the login record', async () => {
				await testRecords.createUserLogin('otheruser');

				await test.put({
					handler,
					url,
					data: {
						email,
						code,
					},
				});

				const records = await test.database.userLogin.findMany();
				expect(records).toHaveLength(1);
				expect(records[0].email).toEqual('otheruser');
			});

			it('Should create the user if they do not exist', async () => {
				await test.put({
					handler,
					url,
					data: {
						email,
						code,
					},
				});

				const records = await test.database.user.findMany();
				expect(records).toHaveLength(1);
				expect(records[0].email).toEqual(email);
			});

			it('Should NOT create the user if they do exist', async () => {
				await testRecords.createUser({
					email,
				});

				await test.put({
					handler,
					url,
					data: {
						email,
						code,
					},
				});

				const records = await test.database.user.findMany();
				expect(records).toHaveLength(1);
			});

			it('Should return the user', async () => {
				const { body } = await test.put({
					handler,
					url,
					data: {
						email,
						code,
					},
				});

				expect(body).toEqual({
					id: expect.any(String),
					email,
				});
			});

			it('Should return the session', async () => {
				const { headers } = await test.put({
					handler,
					url,
					data: {
						email,
						code,
					},
				});

				expect(headers['set-cookie']).toHaveLength(1);
				const cookie = headers['set-cookie'][0];

				expect(cookie).toMatch(/^swordsndice_auth=/);
			});
		});
	});
});
