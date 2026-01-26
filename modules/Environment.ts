/* istanbul ignore file */
export type Environments = 'development' | 'production' | 'test';

export class Environment {
	public static get current(): Environments {
		if (process) {
			return (process.env.VERCEL_ENV ?? process.env.NODE_ENV) as Environments;
		}

		if (window) {
			return window.location.host.includes('localhost')
				? 'development'
				: 'production';
		}

		return 'production';
	}

	public static isLocal() {
		return Environment.current === 'development';
	}

	public static isProduction() {
		return Environment.current === 'production';
	}

	public static isTest() {
		return Environment.current === 'test';
	}
}
