/* istanbul ignore file */
import 'reflect-metadata';
import {getIronSession, type SessionOptions} from 'iron-session';
import type {NextApiResponse} from 'next';
import {createRouter} from 'next-connect';
import {devLog} from '../helpers/DevTools';
import {Env, type EnvDefinition} from '../types/EnvDefinition';
import type {NextHandler, NodeRouter} from '../types/NextConnect';
import {Context} from './Context';
import {Database} from './Database';
import type {EnhancedRequest} from './EnhancedRequest';
import {Environment} from './Environment';
import {ErrorType, type HandledError, Tracer} from './Tracer';

interface APIConfig {
	authenticate?: boolean;
	useTransaction?: boolean;
}

interface ContextConfig {
	url: string;
	userId?: string;
	env: EnvDefinition;
}

export interface SessionData {
	userId: string;
}

const env = Env();

if (!env.sessionKey) {
	throw new Error('Session key missing');
}

export const ironOptions: SessionOptions = {
	cookieName: 'swordsndice_auth',
	password: env.sessionKey,
	cookieOptions: {
		secure: Environment.isProduction(),
	},
};

const ALLOWED_ORIGINS = ['http://localhost:8081', 'https://swordsndice.com'];

export class APIHelper {
	private static database: Database;

	public static getHandler(
		router: NodeRouter<EnhancedRequest, NextApiResponse>,
	) {
		return router.handler({
			onNoMatch: (request, response) => {
				const origin = request.headers.origin ?? '';

				if (request.method === 'OPTIONS') {
					if (ALLOWED_ORIGINS.includes(origin)) {
						response.setHeader('Access-Control-Allow-Origin', origin);
						response.setHeader('Access-Control-Allow-Credentials', 'true');
						response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
						response.setHeader(
							'Access-Control-Allow-Methods',
							'GET,DELETE,PATCH,POST,PUT',
						);
						response.setHeader(
							'Access-Control-Allow-Headers',
							'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
						);
						response.status(200).send(true);
					} else {
						response.status(404).send('Not found');
					}
				}
			},
			onError: (err, request, response) => {
				const error = err as HandledError;
				let status = 500;
				let message = 'Internal server error';

				if (Environment.isLocal() && process.env.NODE_ENV !== 'test') {
					// eslint-disable-next-line no-console
					devLog(error);
				}

				if (
					[ErrorType.Client, ErrorType.Validation].includes(error.type as any)
				) {
					message = error.message;

					if (message.toLowerCase().includes('not found')) {
						status = 404;
					} else {
						status = 400;
					}
				} else {
					if (request.context?.tracer) {
						request.context.tracer.logError(
							request.url ?? 'request',
							error.message,
							error,
						);
					} else {
						devLog(error.message);
					}
				}

				response.status(status).json({
					error: message,
				});
			},
		});
	}

	public static getRouter(
		config?: APIConfig,
	): NodeRouter<EnhancedRequest, NextApiResponse> {
		const router = createRouter<EnhancedRequest, NextApiResponse>();

		router.use(
			async (
				request: EnhancedRequest,
				response: NextApiResponse,
				next: NextHandler,
			) => {
				const origin = request.headers.origin ?? '';

				if (ALLOWED_ORIGINS.includes(origin)) {
					response.setHeader('Access-Control-Allow-Origin', origin);
					response.setHeader('Access-Control-Allow-Credentials', 'true');
					response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
					response.setHeader(
						'Access-Control-Allow-Methods',
						'GET,DELETE,PATCH,POST,PUT',
					);
					response.setHeader(
						'Access-Control-Allow-Headers',
						'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
					);
				}

				const userId = await APIHelper.getUserId(request, response);

				if (config?.authenticate) {
					if (!userId) {
						return response.status(401).json({ error: 'Unauthorised' });
					}
				}

				const contextConfig: ContextConfig = {
					url: request.url as string,
					env,
					userId,
				};

				request.context = await APIHelper.getContext(contextConfig);

				await next();
			},
		);

		return router as any;
	}

	private static async getUserId(
		request: EnhancedRequest,
		response: NextApiResponse,
	): Promise<string | undefined> {
		const session = await getIronSession<SessionData>(
			request,
			response,
			ironOptions,
		);
		return session?.userId;
	}

	private static async getContext({
		userId,
		env,
	}: ContextConfig): Promise<Context> {
		const tracer = new Tracer();

		if (!APIHelper.database) {
			APIHelper.database = new Database(env.database.nonPoolingUrl);
		}

		return new Context({
			tracer,
			database: await APIHelper.database.connect(),
			userId,
			env,
		});
	}
}
