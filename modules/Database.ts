/* istanbul ignore file */
import {Prisma, PrismaClient} from '@prisma/client';

export class Database {
	private readonly dataSource: PrismaClient;

	constructor(url: string) {
		// eslint-disable-next-line turbo/no-undeclared-env-vars
		process.env.TZ = 'utc';

		this.dataSource = new PrismaClient({
			datasourceUrl: url,
		});
	}

	public static sanitise<T>(obj: any): T | null {
		if (!obj) {
			return null;
		}

		for (const key of Object.keys(obj)) {
			if (Prisma.Decimal.isDecimal(obj[key])) {
				obj[key] = obj[key].toNumber();
			} else if (typeof obj[key] === 'object') {
				Database.sanitise(obj[key]);
			}
		}

		return obj;
	}

	public static sanitiseArray<T>(array: any[]): T[] {
		for (const item of array) {
			Database.sanitise(item);
		}

		return array;
	}

	public async connect(): Promise<PrismaClient> {
		await this.dataSource.$connect();

		return this.dataSource;
	}

	public async disconnect() {
		return this.dataSource.$disconnect();
	}
}
