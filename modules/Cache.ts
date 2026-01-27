/* istanbul ignore file */
import { createClient } from 'redis';

interface RedisClient {
	get: (key: string) => Promise<string | undefined>;
	set: (
		key: string,
		value: string,
		options?: { ex?: number; EX?: number },
	) => Promise<void>;
	del: (key: string) => Promise<void>;
}

export class Cache {
	private static client: any;

	public static async get<T>(key: string): Promise<T | undefined> {
		const client = await Cache.getClient();
		const value = (await client.get(key)) as string;

		if (!value) {
			return undefined;
		}

		if (value.startsWith('{')) {
			return JSON.parse(value);
		}

		return value as any;
	}

	public static async set(key: string, value: string | object, ttl?: number) {
		const client = await Cache.getClient();

		await client.set(
			key,
			typeof value === 'string' ? value : JSON.stringify(value),
			ttl ? { ex: ttl, EX: ttl } : undefined,
		);
	}

	public static async delete(key: string) {
		const client = await Cache.getClient();
		await client.del(key);
	}

	public static async end() {
		if (Cache.client) {
			Cache.client.disconnect();
		}
	}

	private static async getClient(): Promise<RedisClient> {
		if (Cache.client) {
			return Cache.client;
		}

		const client = createClient({
			url: process.env.REDIS_URL,
		}) as any;

		await client.connect();

		Cache.client = client;

		return client as any;
	}
}
