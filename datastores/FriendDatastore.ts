import { WithContext } from '../modules';
import type { PublicUser } from '../types/responses/PublicUser.ts';

export class FriendDatastore extends WithContext {
	public async addFriendForUser(
		userId: string,
		friendId: string,
	): Promise<void> {
		try {
			const existing = await this.context.database.friend.findFirst({
				where: { userId, friendId },
			});

			if (existing) return;

			await this.context.database.friend.create({ data: { userId, friendId } });
		} catch (e) {
			const error = e as Error;

			if (error.message.includes('Foreign key constraint violated')) {
				throw this.context.tracer.getClientError('User not found');
			}

			/* istanbul ignore next */
			throw e;
		}
	}

	public async removeFriendForUser(
		userId: string,
		friendId: string,
	): Promise<void> {
		await this.context.database.friend.deleteMany({
			where: { userId, friendId },
		});
	}

	public async getFriendsForUser(userId: string): Promise<PublicUser[]> {
		const friends = await this.context.database.friend.findMany({
			where: { userId, friend: { username: { not: null } } },
			select: {
				friend: { select: { username: true, image: true, id: true } },
			},
		});

		return friends.map(
			(f) =>
				({
					id: f.friend.id,
					username: f.friend.username,
					image: f.friend.image,
				}) as PublicUser,
		);
	}

	public async findFriends(search: string, page = 1): Promise<PublicUser[]> {
		const records = await this.context.database.user.findMany({
			where: {
				username: {
					contains: search,
					mode: 'insensitive',
				},
			},
			select: {
				id: true,
				username: true,
				description: true,
				image: true,
			},
			orderBy: { username: 'asc' },
			take: 50,
			skip: (page - 1) * 50,
		});

		return records as PublicUser[];
	}

	public async isFriend(userId: string, friendId: string): Promise<boolean> {
		return !!(await this.context.database.friend.findFirst({
			where: { userId, friendId },
		}));
	}
}
