import { type Context, WithContext } from '../modules';
import { type FeedItem, FeedItemTypes } from '../types/responses/FeedItem.ts';
import { FriendDatastore } from './FriendDatastore.ts';

export class FeedDatastore extends WithContext {
	private friendDatastore: FriendDatastore;

	constructor(protected context: Context) {
		super(context);

		this.friendDatastore = new FriendDatastore(context);
	}

	public async getFeedForUser(userId: string) {
		const friends = await this.friendDatastore.getFriendsForUser(userId);
		const friendIds = friends.map((x) => x.id);

		const items = await Promise.all([
			this.getFriendsAddedFriends(userId, friendIds),
			this.getGroupsJoinedForFriends(friendIds),
			this.getFriendsGames(userId, friendIds),
		]);

		return items
			.flat()
			.sort((a, b) => b.date.getTime() - a.date.getTime())
			.slice(0, 20);
	}

	public async getFriendsAddedFriends(
		userId: string,
		friends: string[],
	): Promise<FeedItem[]> {
		const records = await this.context.database.friend.findMany({
			where: { userId: { in: friends }, friendId: { not: userId } },
			select: {
				createdAt: true,
				friend: { select: { id: true, username: true } },
				user: { select: { username: true } },
			},
			orderBy: { createdAt: 'desc' },
			take: 20,
		});

		return records.map(({ createdAt, friend, user }) => ({
			id: friend.id,
			type: FeedItemTypes.FriendAdded,
			date: createdAt,
			title: `@${user.username} added @${friend.username} as a friend`,
		}));
	}

	public async getGroupsJoinedForFriends(
		friends: string[],
	): Promise<FeedItem[]> {
		const records = await this.context.database.groupMember.findMany({
			where: { userId: { in: friends }, group: { isPublic: true } },
			select: {
				groupId: true,
				createdAt: true,
				user: {
					select: {
						id: true,
						username: true,
					},
				},
				group: { select: { name: true, image: true, createdByUserId: true } },
			},
			orderBy: { createdAt: 'desc' },
			take: 20,
		});

		return records.map(({ groupId, createdAt, user, group }) => {
			const createdTheGroup = user.id === group.createdByUserId;

			return {
				id: groupId,
				type: createdTheGroup
					? FeedItemTypes.GroupCreated
					: FeedItemTypes.GroupJoined,
				date: createdAt,
				title: `@${user.username} ${createdTheGroup ? 'created' : 'joined'} the ${group.name} group`,
				image: group.image ?? undefined,
			};
		});
	}

	public async getFriendsGames(
		userId: string,
		friends: string[],
	): Promise<FeedItem[]> {
		const records = await this.context.database.gameMember.findMany({
			where: {
				userId: { in: friends },
				game: {
					isStarted: true,
					members: {
						none: { userId },
					},
				},
			},
			select: {
				game: {
					select: {
						id: true,
						game: true,
						points: true,
						isComplete: true,
						updatedAt: true,
						members: {
							select: {
								points: true,
								user: { select: { id: true, username: true, image: true } },
								isWinner: true,
							},
						},
					},
				},
			},
			orderBy: { createdAt: 'desc' },
			take: 20,
		});

		const uniqueGameIds = Array.from(new Set(records.map((x) => x.game.id)));
		const uniqueGames = records.filter((x) =>
			uniqueGameIds.includes(x.game.id),
		);

		return uniqueGames.map(({ game }) => {
			const friendPlayers = game.members
				.filter((x) => friends.includes(x.user.id))
				.map((x) => x.user.username)
				.join(' & ');

			const winners = game.members.filter((member) => member.isWinner);

			return {
				id: game.id,
				type: game.isComplete
					? FeedItemTypes.GameCompleted
					: FeedItemTypes.GameStarted,
				date: game.updatedAt,
				title: game.isComplete
					? `@${friendPlayers} completed a ${game.game} of ${game.points}pts`
					: `@${friendPlayers} started a ${game.game} of ${game.points}pts`,
				subTitle:
					game.isComplete && winners.length > 0
						? `Winner${winners.length > 1 ? 's' : ''}: ${winners.map((x) => `@${x.user.username}`).join(', ')}`
						: undefined,
			} as FeedItem;
		});
	}
}
