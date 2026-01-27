import { v4 as uuid } from 'uuid';
import type { CreateGroupProps } from '../datastores/GroupDatastore';
import type {
	GameEntity,
	GameMemberEntity,
	GroupEntity,
	ListEntity,
	UserEntity,
	UserLoginEntity,
} from '../datastores/entities';
import { WithContext } from '../modules/WithContext.ts';

export class TestRecordHelpers extends WithContext {
	public async createUser(
		overrides?: Partial<UserEntity>,
	): Promise<UserEntity> {
		const id = uuid();

		const record = {
			id,
			email: `${id}@test.com`,
			username: id,
			lastLogin: new Date(),
			description: 'Test Description',
			...overrides,
		} as UserEntity;

		return this.context.database.user.create({ data: record });
	}

	public async createUserLogin(
		email: string,
		overrides?: Partial<UserLoginEntity>,
	): Promise<UserLoginEntity> {
		const id = uuid();

		const record = { code: id, email, ...overrides } as UserLoginEntity;

		return this.context.database.userLogin.create({ data: record });
	}

	public async createFriend(userId: string, friendId: string) {
		await this.context.database.friend.create({ data: { userId, friendId } });
	}

	public async createList(
		userId: string,
		overrides?: Partial<ListEntity>,
	): Promise<ListEntity> {
		const record = {
			userId,
			name: 'Test List',
			army: 'Test Army',
			points: 500,
			actualPoints: 0,
			groups: [],
			game: 'Test Game',
			...overrides,
		} as ListEntity;

		return this.context.database.list.create({ data: record });
	}

	public async createGame(
		userId: string,
		overrides?: Partial<GameEntity>,
	): Promise<GameEntity> {
		const record = {
			game: 'Test Game',
			points: 500,
			inviteCode: 'TESTCODE',
			createdByUserId: userId,
			...overrides,
		} as GameEntity;

		const game = await this.context.database.game.create({
			data: record as any,
		});

		const member = await this.context.database.gameMember.create({
			data: {
				gameId: game.id,
				userId,
				points: 1,
				modelCount: 3,
				modelCountRemaining: 2,
			},
		});

		return {
			...game,
			members: [member],
		};
	}

	public async createGameInvite(
		userId: string,
		gameId: string,
		invitedBy?: string,
	) {
		await this.context.database.gameInvite.create({
			data: { userId, gameId, createdByUserId: invitedBy ?? userId },
		});
	}

	public async createGameMember(
		userId: string,
		gameId: string,
		override?: Partial<GameMemberEntity>,
	) {
		await this.context.database.gameMember.create({
			data: {
				userId,
				gameId,
				points: 1,
				modelCount: 3,
				modelCountRemaining: 2,
				...override,
			},
		});
	}

	public async createGroup(
		userId: string,
		overrides?: Partial<CreateGroupProps>,
	) {
		const record = {
			name: 'Test Group',
			description: 'Test Description',
			image: 'Test Image',
			isPublic: true,
			membersCanInvite: true,
			createdByUserId: userId,
			...overrides,
		};

		const group = await this.context.database.group.create({ data: record });
		await this.createGroupMember(userId, group.id, true);

		return group as GroupEntity;
	}

	public async createGroupMember(
		userId: string,
		groupId: string,
		isAdmin = false,
	) {
		await this.context.database.groupMember.create({
			data: { userId, groupId, isAdmin },
		});
	}

	public async createGroupInvite(
		userId: string,
		groupId: string,
		invitedBy?: string,
	) {
		await this.context.database.groupInvite.create({
			data: { userId, groupId, createdByUserId: invitedBy ?? userId },
		});
	}
}

export const MockListBody = {
	id: 'id',
	name: 'My list',
	game: 'game',
	army: 'army',
	points: 400,
	actualPoints: 400,
	groups: [
		{
			id: 'id',
			leader: {
				id: 'id',
				name: 'Leader',
				amount: 1,
				points: 10,
				equipment: [
					{
						name: 'Sword',
						points: 5,
					},
				],
				slot: 'slot',
				notes: 'notes',
			},
			members: [
				{
					id: 'id',
					name: 'Member',
					amount: 1,
					points: 10,
					slot: 'slot',
					equipment: [
						{
							name: 'Sword',
							points: 5,
						},
					],
				},
			],
		},
	],
};
