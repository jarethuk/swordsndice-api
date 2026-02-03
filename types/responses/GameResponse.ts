import { Expose, Type } from 'class-transformer';
import {
	IsArray,
	IsBoolean,
	IsDate,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { ListBody } from '../ListBody.ts';
import { PublicUser } from './PublicUser.ts';

export class GameResponseMember {
	@Expose()
	@IsString()
	public id!: string;

	@Expose()
	@ValidateNested()
	@Type(() => PublicUser)
	public user?: PublicUser;

	@Expose()
	@IsOptional()
	@ValidateNested()
	@Type(() => ListBody)
	public list?: ListBody | null;

	@Expose()
	@IsNumber()
	public points!: number;

	@Expose()
	@IsOptional()
	@IsBoolean()
	public isWinner?: boolean;

	@IsInt()
	@Expose()
	public modelCount!: number;

	@IsInt()
	@Expose()
	public modelCountRemaining!: number;
}

export class /* istanbul ignore file */
GameResponse {
	@Expose()
	@IsString()
	public id!: string;

	@Expose()
	@IsDate()
	public createdAt!: Date;

	@Expose()
	@IsDate()
	public updatedAt!: Date;

	@Expose()
	@ValidateNested()
	@Type(() => PublicUser)
	public createdBy!: PublicUser;

	@Expose()
	@IsString()
	public game!: string;

	@Expose()
	@IsNumber()
	public points!: number;

	@Expose()
	@IsOptional()
	@IsString()
	public image?: string | null;

	@Expose()
	@IsOptional()
	@IsString()
	public inviteCode?: string | null;

	@Expose()
	@IsOptional()
	@IsString()
	public description?: string | null;

	@Expose()
	@IsBoolean()
	public isStarted!: boolean;

	@Expose()
	@IsBoolean()
	public isComplete!: boolean;

	@Expose()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => GameResponseMember)
	public members!: GameResponseMember[];

	@Expose()
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => PublicUser)
	public invites?: PublicUser[];
}
