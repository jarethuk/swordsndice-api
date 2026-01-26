import handler, { healthSecret } from './health.page';
import {NextTestHelper} from '../../modules/NextTestHelper';

describe('/health', () => {
	const url = '/api/health';

	const test = new NextTestHelper();

	beforeAll(async () => {
		await test.initialise(url);
	});

	afterAll(async () => {
		await test.end();
	});

	async function makeRequest(secret?: string): Promise<string> {
		const { body } = await test.get({
			handler,
			url: `${url}${secret ? `?secret=${secret}` : ''}`,
		});

		return body;
	}

	it('Should error if the secret is wrong', async () => {
		await expect(() => makeRequest()).rejects.toThrow('404 - Not found');
	});

	it('Should return All Good when success', async () => {
		const result = await makeRequest(healthSecret);
		expect(result).toEqual('All good');
	});
});
