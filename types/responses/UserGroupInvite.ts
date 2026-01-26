/* istanbul ignore file */
import {Expose, Type} from 'class-transformer';
import {IsDate, IsOptional, IsString, ValidateNested} from 'class-validator';
import {PublicUser} from './PublicUser.ts';

export class UserGroupInvite {
	@Expose()
	@IsString()
	public id!: string;

	@Expose()
	@IsString()
	public name!: string;

	@Expose()
	@IsOptional()
	@IsString()
	public description?: string | null;

	@Expose()
	@IsOptional()
	@IsString()
	public image?: string | null;

	@Expose()
	@ValidateNested()
	@Type(() => PublicUser)
	public createdBy!: PublicUser;

	@Expose()
	@IsDate()
	public createdAt!: Date;
}
