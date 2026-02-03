/* istanbul ignore file */
import { Expose, Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { ListBody } from '../ListBody.ts';
import { GameListResponse } from './GameListResponse.ts';
import { PublicUser } from './PublicUser.ts';

export class PublicUserFull extends PublicUser {
	@Expose()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => ListBody)
	public lists?: ListBody[];

	@Expose()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => GameListResponse)
	public games?: GameListResponse[];
}
