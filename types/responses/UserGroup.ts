/* istanbul ignore file */
import { Expose, Type } from 'class-transformer';
import {
	IsBoolean,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { PublicUser } from './PublicUser.ts';

export class UserGroup {
	@Expose()
	@IsString()
	public id!: string;

	@Expose()
	@IsString()
	public name!: string;

	@Expose()
	@IsOptional()
	@IsString()
	public description?: string;

	@Expose()
	@IsOptional()
	@IsString()
	public image?: string;

	@Expose()
	@IsBoolean()
	public isPublic!: boolean;

	@Expose()
	@IsBoolean()
	public membersCanInvite!: boolean;

	@Expose()
	@ValidateNested()
	@Type(() => PublicUser)
	public createdBy!: PublicUser;
}
