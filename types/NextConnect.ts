/* istanbul ignore file */
export type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type FunctionLike = (...args: any[]) => unknown;
export type RouteMatch = string | RegExp;
export type NextHandler = () => ValueOrPromise<any>;
export type Nextable<H extends FunctionLike> = (
	...args: [...Parameters<H>, NextHandler]
) => ValueOrPromise<any>;
export type FindResult<H extends FunctionLike> = {
	fns: Nextable<H>[];
	params: Record<string, string>;
	middleOnly: boolean;
};
export interface HandlerOptions<Handler extends FunctionLike> {
	onNoMatch?: Handler;
	onError?: (err: unknown, ...args: Parameters<Handler>) => ReturnType<Handler>;
}
export type ValueOrPromise<T> = T | Promise<T>;
export type RouteShortcutMethod<This, H extends FunctionLike> = (
	route: RouteMatch | Nextable<H>,
	...fns: Nextable<H>[]
) => This;

import type {IncomingMessage, ServerResponse} from 'node:http';

export type RequestHandler<
	Req extends IncomingMessage,
	Res extends ServerResponse,
> = (req: Req, res: Res) => ValueOrPromise<void>;
export declare class NodeRouter<
	Req extends IncomingMessage = IncomingMessage,
	Res extends ServerResponse = ServerResponse,
> {
	all: RouteShortcutMethod<this, RequestHandler<Req, Res>>;
	get: RouteShortcutMethod<this, RequestHandler<Req, Res>>;
	head: RouteShortcutMethod<this, RequestHandler<Req, Res>>;
	post: RouteShortcutMethod<this, RequestHandler<Req, Res>>;
	put: RouteShortcutMethod<this, RequestHandler<Req, Res>>;
	patch: RouteShortcutMethod<this, RequestHandler<Req, Res>>;
	delete: RouteShortcutMethod<this, RequestHandler<Req, Res>>;
	private router;
	private add;
	private prepareRequest;

	use(
		base:
			| RouteMatch
			| Nextable<RequestHandler<Req, Res>>
			| NodeRouter<Req, Res>,
		...fns: (Nextable<RequestHandler<Req, Res>> | NodeRouter<Req, Res>)[]
	): this;

	clone(): NodeRouter<Req, Res>;
	run(req: Req, res: Res): Promise<unknown>;
	handler(
		options?: HandlerOptions<RequestHandler<Req, Res>>,
	): (req: Req, res: Res) => Promise<void>;
}
export declare function getPathname(url: string): string;
export declare function createRouter<
	Req extends IncomingMessage,
	Res extends ServerResponse,
>(): NodeRouter<Req, Res>;
