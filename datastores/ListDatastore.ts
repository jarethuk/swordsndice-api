import {WithContext} from '../modules';
import type {ListEntity} from './entities';

export interface CreateListProps {
	name: string;
	game: string;
	army: string;
	points: number;
	actualPoints: number;
	image?: string | null;
	description?: string | null;
	groups: any[];
}

export interface UpdateListProps {
	name?: string;
	army?: string;
	points?: number;
	actualPoints?: number;
	image?: string | null;
	description?: string | null;
	groups?: any[];
}

export class ListDatastore extends WithContext {
	public async getListsForUser(userId: string): Promise<ListEntity[]> {
		return this.context.database.list.findMany({
			where: { userId, isDeleted: false },
		});
	}

	public async getListForUser(
		userId: string,
		listId: string,
	): Promise<ListEntity> {
		const list = await this.context.database.list.findFirst({
			where: { userId, id: listId },
		});

		if (!list) {
			throw this.context.tracer.getClientError('List not found');
		}

		return list;
	}

	public async createListForUser(
		userId: string,
		list: CreateListProps,
	): Promise<string> {
		const { id } = await this.context.database.list.create({
			data: { ...list, userId },
		});

		return id;
	}

	public async updateListForUser(
		userId: string,
		id: string,
		list: UpdateListProps,
	): Promise<void> {
		try {
			await this.context.database.list.update({
				where: { userId, id },
				data: list,
			});
		} catch (e) {
			const error = e as Error;

			if (error.message.includes('Record to update not found')) {
				throw this.context.tracer.getClientError('List not found', { e });
			}

			/* istanbul ignore next */
			throw e;
		}
	}

	public async deleteListForUser(userId: string, id: string): Promise<void> {
		try {
			await this.context.database.list.update({
				where: { userId, id },
				data: { isDeleted: true },
			});
		} catch (e) {
			const error = e as Error;

			if (error.message.includes('Record to update not found')) {
				throw this.context.tracer.getClientError('List not found', { e });
			}

			/* istanbul ignore next */
			throw e;
		}
	}
}
