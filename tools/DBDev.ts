import { Database } from '../modules/Database.ts';
import { resetDatabase } from './DevHelpers.ts';
import { FangornDevList, ThorinsDevList } from './DevLists.ts';

const connectionString =
	'postgresql://postgres:postgres@localhost:5432/swordsndice';

const DEV_USER_ID = '8630a80f-34b6-4aae-ab2e-5534e250060a';
const TEST_1_USER_ID = '8630a80f-34b6-4aae-ab2e-5534e250060b';
const TEST_2_USER_ID = '8630a80f-34b6-4aae-ab2e-5534e250060c';

const PUBLIC_GROUP = '8630a80f-34b6-4aae-ab2e-5534e250060a';
const PRIVATE_GROUP = '8630a80f-34b6-4aae-ab2e-5534e250060b';
const DEV_USER_GROUP = '8630a80f-34b6-4aae-ab2e-5534e250060c';

const DEV_USER_GAME_ID = '8630a80f-34b6-4aae-ab2e-5534e250060c';
const TEST_1_USER_GAME_ID = '8630a80f-34b6-4aae-ab2e-5534e250060d';
const READY_GAME_ID = '0630a80f-34b6-4aae-ab2e-5534e250060d';

const MOCK_IMAGE = 'https://api.swordsndice.com/placeholder.jpg';
const MOCK_DESCRIPTION =
	'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec placerat lacinia libero, porttitor dapibus eros ultrices sit amet. Integer lobortis turpis ipsum, et suscipit sem ullamcorper eu.';

(async () => {
	console.log('Setting up dev database...');

	await resetDatabase(connectionString);

	const client = new Database(connectionString);
	const db = await client.connect();

	/* Users */
	await db.user.create({
		data: {
			id: DEV_USER_ID,
			email: 'dev@test.com',
			username: 'jarethuk',
			lastLogin: new Date(),
			description: MOCK_DESCRIPTION,
			image: MOCK_IMAGE,
		},
	});

	await db.user.create({
		data: {
			id: TEST_1_USER_ID,
			email: 'test1@test.com',
			username: 'test1',
			lastLogin: new Date(),
			description: MOCK_DESCRIPTION,
			image: MOCK_IMAGE,
		},
	});

	await db.user.create({
		data: {
			id: TEST_2_USER_ID,
			email: 'test2@test.com',
			username: 'test2',
			lastLogin: new Date(),
			description: MOCK_DESCRIPTION,
			image: MOCK_IMAGE,
		},
	});

	/* Friends */
	await db.friend.create({
		data: {
			userId: DEV_USER_ID,
			friendId: TEST_1_USER_ID,
		},
	});

	/* Groups */
	await db.group.create({
		data: {
			id: DEV_USER_GROUP,
			name: 'My Group',
			createdByUserId: DEV_USER_ID,
			isPublic: true,
			membersCanInvite: true,
			description: MOCK_DESCRIPTION,
			image: MOCK_IMAGE,
		},
	});

	await db.group.create({
		data: {
			id: PUBLIC_GROUP,
			name: 'Test Public Group',
			createdByUserId: TEST_1_USER_ID,
			isPublic: true,
			membersCanInvite: true,
			description: MOCK_DESCRIPTION,
			image: MOCK_IMAGE,
		},
	});

	await db.group.create({
		data: {
			id: PRIVATE_GROUP,
			name: 'Test Private Group',
			createdByUserId: TEST_1_USER_ID,
			isPublic: false,
			membersCanInvite: true,
			description: MOCK_DESCRIPTION,
			image: MOCK_IMAGE,
		},
	});

	/* Group Members */
	await db.groupMember.create({
		data: {
			userId: DEV_USER_ID,
			groupId: DEV_USER_GROUP,
			isAdmin: true,
		},
	});

	await db.groupMember.create({
		data: {
			userId: TEST_1_USER_ID,
			groupId: DEV_USER_GROUP,
			isAdmin: false,
		},
	});

	await db.groupMember.create({
		data: {
			userId: TEST_1_USER_ID,
			groupId: PUBLIC_GROUP,
			isAdmin: true,
		},
	});

	await db.groupMember.create({
		data: {
			userId: TEST_1_USER_ID,
			groupId: PRIVATE_GROUP,
			isAdmin: true,
		},
	});

	await db.groupMember.create({
		data: {
			userId: TEST_2_USER_ID,
			groupId: PRIVATE_GROUP,
			isAdmin: true,
		},
	});

	/* Group Invites */
	await db.groupInvite.create({
		data: {
			userId: DEV_USER_ID,
			groupId: PRIVATE_GROUP,
			createdByUserId: TEST_1_USER_ID,
		},
	});

	await db.groupInvite.create({
		data: {
			userId: TEST_2_USER_ID,
			groupId: DEV_USER_GROUP,
			createdByUserId: DEV_USER_ID,
		},
	});

	/* List */
	await db.list.create({
		data: {
			...FangornDevList,
			isDeleted: false,
			userId: DEV_USER_ID,
			image: MOCK_IMAGE,
		} as any,
	});

	await db.list.create({
		data: {
			...ThorinsDevList,
			id: '21f4aa0e-f852-4f20-978a-dbe8f1bcdc96',
			isDeleted: false,
			userId: DEV_USER_ID,
			image: MOCK_IMAGE,
		} as any,
	});

	await db.list.create({
		data: {
			...ThorinsDevList,
			isDeleted: false,
			userId: TEST_1_USER_ID,
			image: MOCK_IMAGE,
		} as any,
	});

	/* Games */
	await db.game.create({
		data: {
			id: DEV_USER_GAME_ID,
			game: 'MESGB',
			points: 500,
			inviteCode: 'TESTCODE',
			createdByUserId: DEV_USER_ID,
			description: MOCK_DESCRIPTION,
			image: MOCK_IMAGE,
		},
	});

	await db.gameMember.create({
		data: {
			userId: DEV_USER_ID,
			gameId: DEV_USER_GAME_ID,
		},
	});

	await db.game.create({
		data: {
			id: TEST_1_USER_GAME_ID,
			game: 'MESGB',
			points: 750,
			inviteCode: 'TEST',
			createdByUserId: TEST_1_USER_ID,
			image: MOCK_IMAGE,
			isStarted: true,
		},
	});

	await db.gameMember.create({
		data: {
			userId: TEST_1_USER_ID,
			gameId: TEST_1_USER_GAME_ID,
			list: ThorinsDevList,
		},
	});

	await db.gameMember.create({
		data: {
			userId: TEST_2_USER_ID,
			gameId: TEST_1_USER_GAME_ID,
			list: ThorinsDevList,
		},
	});

	/* Ready Game */
	await db.game.create({
		data: {
			id: READY_GAME_ID,
			game: 'MESGB',
			points: 750,
			inviteCode: 'TESTCODE',
			createdByUserId: DEV_USER_ID,
			description: MOCK_DESCRIPTION,
			image: MOCK_IMAGE,
		},
	});

	await db.gameMember.create({
		data: {
			userId: DEV_USER_ID,
			gameId: READY_GAME_ID,
			list: FangornDevList,
		},
	});

	await db.gameMember.create({
		data: {
			userId: TEST_1_USER_ID,
			gameId: READY_GAME_ID,
			list: ThorinsDevList,
		},
	});

	/* Game Invites */
	await db.gameInvite.create({
		data: {
			userId: DEV_USER_ID,
			gameId: TEST_1_USER_GAME_ID,
			createdByUserId: TEST_1_USER_ID,
		},
	});

	await client.disconnect();

	console.log('Done');
	process.exit();
})();
