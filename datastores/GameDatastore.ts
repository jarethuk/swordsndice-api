import {WithContext} from '../modules';
import type {ListBody} from '../types/ListBody.ts';
import type {GameInviteResponse} from '../types/responses/GameInviteResponse.ts';
import type {GameListResponse} from '../types/responses/GameListResponse.ts';
import type {GameResponse} from '../types/responses/GameResponse.ts';
import type {PublicUser} from '../types/responses/PublicUser.ts';

export interface CreateGameProps {
	game: string;
	description?: string;
	image?: string;
	points: number;
	inviteCode: string;
}

export interface UpdateGameProps {
	description?: string;
	image?: string;
	points?: number;
	isStarted?: boolean;
	isComplete?: boolean;
}

export interface InviteToGameProps {
	userId: string;
	gameId: string;
	friendId: string;
}

export interface JoinGameProps {
	userId: string;
	gameId: string;
	inviteCode: string;
}

export interface SetGameListProps {
	userId: string;
	gameId: string;
	list?: any;
}

export interface UpdateGameMemberProps {
	points?: number;
	modelCount?: number;
	modelCountRemaining?: number;
}

export class GameDatastore extends WithContext {
	public async createGameForUser(
		userId: string,
		game: CreateGameProps,
	): Promise<string> {
		const { id } = await this.context.database.game.create({
			data: { ...game, createdByUserId: userId },
		});

		await this.context.database.gameMember.create({
			data: { userId, gameId: id },
		});

		return id;
	}

	private async ensureIsMember(userId: string, gameId: string) {
		const member = await this.context.database.gameMember.findFirst({
			where: { userId, gameId },
		});

		if (!member) {
			throw this.context.tracer.getClientError('Game not found');
		}
	}

	public async updateGameForUser(
		userId: string,
		gameId: string,
		update: UpdateGameProps,
	): Promise<void> {
		await this.ensureIsMember(userId, gameId);

		await this.context.database.game.update({
			where: { id: gameId },
			data: { ...update },
		});

		if (update.isStarted) {
			await this.onGameStart(userId, gameId);
		}

		if (update.isComplete) {
			await this.onGameComplete(userId, gameId);
		}
	}

	private async onGameStart(userId: string, gameId: string) {
		const members = await this.context.database.gameMember.findMany({
			where: { gameId },
			select: { list: true, id: true },
		});
		const promises = [];

		for (const member of members) {
			if (!member.list) {
				throw this.context.tracer.getClientError(
					'All members must have a list to start a game.',
				);
			}

			const list = member.list as unknown as ListBody;
			let count = 0;

			for (const group of list.groups) {
				// Leader
				count += 1;

				for (const unit of group.members) {
					count += unit.amount;
				}
			}

			promises.push(
				this.context.database.gameMember.update({
					where: { id: member.id },
					data: { modelCount: count, modelCountRemaining: count },
				}),
			);
		}

		await Promise.all(promises);
	}

	private async onGameComplete(userId: string, gameId: string) {
		const game = await this.getGameForUser(userId, gameId);

		const maxPoints = Math.max(...game.members.map((m) => m.points ?? 0));
		const winners = game.members
			.filter((member) => (member.points ?? 0) === maxPoints)
			.map((x) => (x.user as PublicUser).id);

		await this.context.database.gameMember.updateMany({
			where: {
				userId: {
					in: winners,
				},
				gameId,
			},
			data: {
				isWinner: true,
			},
		});

		await this.context.database.gameMember.updateMany({
			where: {
				userId: {
					notIn: winners,
				},
				gameId,
			},
			data: {
				isWinner: false,
			},
		});
	}

	public async deleteGameForUser(
		userId: string,
		gameId: string,
	): Promise<void> {
		try {
			await this.ensureIsMember(userId, gameId);

			await this.context.database.game.delete({
				where: { id: gameId },
			});
		} catch (e) {
			const error = e as Error;

			if (error.message === 'Game not found') {
				return;
			}

			/* istanbul ignore next */
			throw e;
		}
	}

	public async getGameForUser(
		userId: string,
		gameId: string,
	): Promise<GameResponse> {
		const game = await this.context.database.game.findFirst({
			where: { id: gameId },
			select: {
				id: true,
				createdAt: true,
				updatedAt: true,
				game: true,
				points: true,
				image: true,
				description: true,
				isStarted: true,
				isComplete: true,
				inviteCode: true,
				createdBy: { select: { id: true, username: true, image: true } },
				members: {
					select: {
						id: true,
						user: {
							select: { id: true, username: true, image: true },
						},
						list: true,
						points: true,
						isWinner: true,
						modelCount: true,
						modelCountRemaining: true,
					},
				},
				invites: {
					select: {
						user: {
							select: { id: true, username: true, image: true },
						},
					},
				},
			},
		});

		if (!game) {
			throw this.context.tracer.getClientError('Game not found');
		}

		const isMember = !!game.members.find((m) => m.user.id === userId);

		return {
			...game,
			...(!isMember && { inviteCode: null }),
			invites: game.invites.map((i) => i.user as PublicUser),
		} as unknown as GameResponse;
	}

	public async inviteToGame({ gameId, userId, friendId }: InviteToGameProps) {
		await this.ensureIsMember(userId, gameId);

		const existingMember = await this.context.database.gameMember.findFirst({
			where: { userId: friendId, gameId },
		});

		if (existingMember) return;

		const existingInvite = await this.context.database.gameInvite.findFirst({
			where: { userId: friendId, gameId },
		});

		if (existingInvite) return;

		await this.context.database.gameInvite.create({
			data: { userId: friendId, gameId, createdByUserId: userId },
		});
	}

	public async cancelInviteToGame({
		gameId,
		userId,
		friendId,
	}: InviteToGameProps) {
		await this.ensureIsMember(userId, gameId);
		await this.context.database.gameInvite.deleteMany({
			where: { userId: friendId, gameId },
		});
	}

	public async acceptInviteForUser(
		userId: string,
		gameId: string,
	): Promise<void> {
		const invite = await this.context.database.gameInvite.findFirst({
			where: { userId, gameId },
		});

		if (!invite) {
			throw this.context.tracer.getClientError('Invite not found');
		}

		await this.context.database.gameInvite.delete({ where: { id: invite.id } });
		await this.context.database.gameMember.create({
			data: { userId: invite.userId, gameId },
		});
	}

	public async joinGameByCodeForUser({
		userId,
		gameId,
		inviteCode,
	}: JoinGameProps) {
		const game = await this.context.database.game.findFirst({
			where: { id: gameId, inviteCode },
		});

		if (!game) throw this.context.tracer.getClientError('Game not found');

		await this.context.database.gameInvite.deleteMany({
			where: { gameId, userId },
		});

		await this.context.database.gameMember.create({ data: { userId, gameId } });
	}

	public async declineInviteForUser(userId: string, gameId: string) {
		await this.context.database.gameInvite.deleteMany({
			where: { userId, gameId },
		});
	}

	public async leaveGameForUser(userId: string, gameId: string) {
		await this.context.database.gameMember.deleteMany({
			where: { userId, gameId },
		});

		const members = await this.context.database.gameMember.count({
			where: { gameId },
		});

		if (members === 0) {
			await this.context.database.game.deleteMany({ where: { id: gameId } });
		}
	}

	public async setGameListForUser({ userId, list, gameId }: SetGameListProps) {
		await this.ensureIsMember(userId, gameId);

		await this.context.database.gameMember.updateMany({
			where: { gameId, userId },
			data: { list },
		});
	}

	public async getUserGames(
		userId: string,
		state?: 'active' | 'complete',
	): Promise<GameListResponse[]> {
		const games = await this.context.database.gameMember.findMany({
			where: {
				userId,
				...(state
					? state === 'active'
						? { game: { isComplete: false } }
						: { game: { isComplete: true } }
					: {}),
			},
			orderBy: {
				createdAt: 'desc',
			},
			select: {
				game: {
					select: {
						id: true,
						createdAt: true,
						updatedAt: true,
						game: true,
						points: true,
						members: {
							select: {
								user: {
									select: {
										id: true,
										username: true,
										image: true,
									},
								},
								list: true,
								isWinner: true,
							},
						},
					},
				},
			},
		});

		return games.map(
			({ game: { id, game, createdAt, points, members } }) =>
				({
					id: id,
					game,
					createdAt,
					points,
					members: members.map((x) => ({
						id: x.user.id,
						username: x.user.username,
						image: x.user.image,
						army: x.list ? (x.list as unknown as ListBody).army : undefined,
						isWinner: x.isWinner,
					})),
				}) as GameListResponse,
		);
	}

	public async getGameInvites(userId: string): Promise<GameInviteResponse[]> {
		const games = await this.context.database.gameInvite.findMany({
			where: { userId },
			select: {
				game: {
					select: {
						id: true,
						createdAt: true,
						game: true,
						points: true,
					},
				},
				createdBy: { select: { id: true, username: true, image: true } },
			},
		});

		return games.map(
			({ game, createdBy }) =>
				({
					...game,
					invitedBy: createdBy,
				}) as GameInviteResponse,
		);
	}

	public async updateGameMember(
		userId: string,
		gameId: string,
		memberId: string,
		update: UpdateGameMemberProps,
	) {
		await this.ensureIsMember(userId, gameId);

		await this.context.database.gameMember.updateMany({
			where: { gameId, userId: memberId },
			data: update,
		});
	}
}
