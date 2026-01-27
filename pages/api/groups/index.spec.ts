import type { GroupEntity, UserEntity } from '../../../datastores/entities';
import { TestRecordHelpers } from '../../../helpers';
import { NextTestHelper } from '../../../modules';
import type { CreateGroupRequest } from '../../../types/requests/CreateGroupRequest.ts';
import type { UserGroup } from '../../../types/responses/UserGroup.ts';
import handler from './index.page';

describe('/groups', () => {
	const url = '/api/groups';

	const test = new NextTestHelper();
	let testRecordHelpers: TestRecordHelpers;
	let user: UserEntity;
	let group: GroupEntity;

	beforeAll(async () => {
		const context = await test.initialise(url);
		testRecordHelpers = new TestRecordHelpers(context);
	});

	afterAll(async () => {
		await test.end();
	});

	beforeEach(async () => {
		user = await testRecordHelpers.createUser();
		group = await testRecordHelpers.createGroup(user.id);
	});

	describe('GET /', () => {
		test.checkAuthorised({
			handler,
			url,
			method: 'GET',
		});

		it('Should return a list of groups for the user', async () => {
			const { body } = await test.get({
				handler,
				url,
				user,
			});

			expect(body).toEqual([
				{
					id: group.id,
					image: group.image,
					name: group.name,
					createdBy: {
						id: user.id,
						username: user.username,
						image: user.image,
					},
					membersCanInvite: group.membersCanInvite,
					description: group.description,
					isPublic: group.isPublic,
				},
			] as UserGroup[]);
		});
	});

	describe('PUT /', () => {
		const request: CreateGroupRequest = {
			name: 'name',
			description: 'description',
			image: 'image',
			membersCanInvite: true,
		};

		test.checkAuthorised({
			handler,
			url,
			method: 'PUT',
			data: request,
		});

		it('Should create the group', async () => {
			const { body } = await test.put({
				handler,
				url,
				user,
				data: request,
			});

			const result = await test.database.group.findFirst({
				where: { id: body.id },
			});

			expect(result).toEqual(expect.objectContaining(request));
		});
	});
});
