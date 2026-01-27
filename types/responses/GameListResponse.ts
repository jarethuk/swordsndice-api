/* istanbul ignore file */
import { Expose, Type } from 'class-transformer';
import {
	IsBoolean,
	IsDate,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { PublicUser } from './PublicUser.ts';

export class GameListMemberResponse extends PublicUser {
	@Expose()
	@IsOptional()
	@IsString()
	public army?: string;

	@Expose()
	@IsOptional()
	@IsBoolean()
	public isWinner?: boolean;
}

export class GameListResponse {
	@Expose()
	@IsString()
	public id!: string;

	@Expose()
	@IsDate()
	public createdAt!: Date;

	@Expose()
	@IsString()
	public game!: string;

	@Expose()
	@IsNumber()
	public points!: number;

	@Expose()
	@ValidateNested()
	@Type(() => GameListMemberResponse)
	public members!: GameListMemberResponse[];
}
