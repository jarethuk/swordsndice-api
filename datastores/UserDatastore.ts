import dayjs from 'dayjs';
import { WithContext } from '../modules';
import type { PublicUser } from '../types/responses/PublicUser.ts';
import type { UserEntity } from './entities';

interface UseLoginTokenProps {
	email: string;
	code: string;
}

interface CreateUserProps {
	email: string;
}

interface UpdateUserProps {
	email?: string;
	username?: string;
	image?: string;
	lastLogin?: Date;
}

const userColumns = {
	email: true,
	id: true,
	image: true,
	username: true,
	createdAt: true,
	updatedAt: true,
	lastLogin: true,
	description: true,
};

export class UserDatastore extends WithContext {
	public async getUserByEmail(email: string): Promise<UserEntity | null> {
		return this.context.database.user.findUnique({
			where: { email },
			select: userColumns,
		});
	}

	public async getUserByUsername(username: string): Promise<UserEntity | null> {
		return this.context.database.user.findUnique({
			where: { username },
			select: userColumns,
		});
	}

	public async getUserById(id: string): Promise<UserEntity | null> {
		return this.context.database.user.findUnique({
			where: { id },
			select: userColumns,
		});
	}

	public async createUser(user: CreateUserProps): Promise<string> {
		const { id } = await this.context.database.user.create({
			data: {
				...user,
				lastLogin: new Date(),
			},
		});
		return id;
	}

	public async updateUser(id: string, user: UpdateUserProps): Promise<void> {
		await this.context.database.user.update({ where: { id }, data: user });
	}

	private generateSixDigitCode(): string {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}

	public async createUserLoginToken(email: string): Promise<string> {
		const code = this.generateSixDigitCode();

		await this.context.database.userLogin.create({
			data: {
				email,
				code,
			},
		});

		return code;
	}

	public async useLoginToken({
		code,
		email,
	}: UseLoginTokenProps): Promise<void> {
		const record = await this.context.database.userLogin.findFirst({
			where: { email, code },
			orderBy: { createdAt: 'desc' },
		});

		if (!record) {
			throw this.context.tracer.getClientError('Invalid code');
		}

		if (dayjs().isAfter(dayjs(record.createdAt).add(5, 'minutes'))) {
			throw this.context.tracer.getClientError('Code expired');
		}

		await this.context.database.userLogin.delete({ where: { id: record.id } });
	}

	public async clearTokens(): Promise<void> {
		await this.context.database.userLogin.deleteMany({
			where: {
				createdAt: { lt: dayjs().subtract(5, 'minutes').toDate() },
			},
		});
	}

	public async findFriend(search: string): Promise<PublicUser[]> {
		const results = await this.context.database.user.findMany({
			where: { username: { contains: search, mode: 'insensitive' } },
			select: { id: true, username: true, image: true },
			orderBy: { username: 'asc' },
		});

		return results as PublicUser[];
	}
}
