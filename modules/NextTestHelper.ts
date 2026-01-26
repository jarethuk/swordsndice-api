/* istanbul ignore file */
import type {Server} from 'node:http';
import * as http from 'node:http';
import {apiResolver} from 'next/dist/server/api-utils/node/api-resolver';
import supertest from 'supertest';
import type {UserEntity} from '../datastores/entities/UserEntity';
import {TestFramework} from '../helpers/TestFramework';
import {APIHelper} from './APIHelper';

interface RequestOptions {
	parameters?: any;
	url: string;
	data?: any;
	skipContextMock?: boolean;
	handler: any;
	withEscalatedPrivileges?: boolean;
	cookie?: string;
	user?: UserEntity;
}

export class NextTestHelper extends TestFramework {
	public async get(options: RequestOptions): Promise<supertest.Test> {
		const { url, server } = this.getServer(options);
		const result = await supertest(server)
			.get(url)
			.set('Cookie', [options.cookie ?? '']);

		this.checkResponse(result);

		return result;
	}

	public async put(options: RequestOptions): Promise<supertest.Test> {
		const { url, server } = this.getServer(options);
		const result = await supertest(server)
			.put(url)
			.set('Cookie', [options.cookie ?? ''])
			.send(options?.data);

		this.checkResponse(result);

		return result;
	}

	public async patch(options: RequestOptions): Promise<supertest.Test> {
		const { url, server } = this.getServer(options);
		const result = await supertest(server)
			.patch(url)
			.set('Cookie', [options.cookie ?? ''])
			.send(options?.data);

		this.checkResponse(result);

		return result;
	}

	public async delete(options: RequestOptions): Promise<supertest.Test> {
		const { url, server } = this.getServer(options);
		const result = await supertest(server)
			.delete(url)
			.set('Cookie', [options.cookie ?? '']);

		this.checkResponse(result);

		return result;
	}

	public checkAuthorised({
		url,
		data,
		method,
		parameters,
		handler,
	}: {
		url: string;
		data?: any;
		method: 'GET' | 'PUT' | 'PATCH' | 'DELETE';
		parameters?: any;
		handler?: any;
	}) {
		it('Should error when NOT logged in', async () => {
			let error: Error | undefined;

			try {
				switch (method) {
					case 'GET':
						await this.get({
							url,
							parameters,
							handler,
						});
						break;

					case 'PUT':
						await this.put({
							url,
							data,
							parameters,
							handler,
						});
						break;

					case 'PATCH':
						await this.patch({
							url,
							data,
							parameters,
							handler,
						});
						break;

					case 'DELETE':
						await this.delete({
							url,
							parameters,
							handler,
						});
						break;
				}
			} catch (e) {
				error = e as Error;
			}

			expect(error).toBeDefined();
			expect(error?.message.includes('Unauthorised')).toBeTruthy();
		});
	}

	public getServer({
		handler,
		skipContextMock,
		parameters,
		url,
		user,
		withEscalatedPrivileges,
	}: RequestOptions): {
		server: Server;
		url: string;
	} {
		const server = http.createServer((request, response) =>
			apiResolver(
				request,
				response,
				parameters ?? {},
				handler,
				{} as any,
				true,
			),
		);

		if (!skipContextMock) {
			jest.spyOn<any, any>(APIHelper, 'getUserId').mockReturnValue(user?.id);

			jest.spyOn<any, any>(APIHelper, 'getContext').mockResolvedValue(
				this.getTestContext({
					userId: user?.id,
					withEscalatedPrivileges,
				}),
			);
		}

		url = url.replace('/index', '');

		if (parameters) {
			for (const key of Object.keys(parameters)) {
				url = url.replace(`[${key}]`, parameters[key]);
			}
		}

		return { server, url };
	}

	private checkResponse(response: any) {
		if (response.body?.error) {
			throw new Error(`[${response.request.url}] ${response.body.error}`);
		}

		if (response.statusCode !== 200) {
			throw new Error(
				`[${response.request.url}] ${response.statusCode} - ${response.text}`,
			);
		}
	}
}
