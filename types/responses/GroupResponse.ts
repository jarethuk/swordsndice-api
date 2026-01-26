/* istanbul ignore file */
import {Expose, Type} from 'class-transformer';
import {IsBoolean, IsOptional, IsString, IsUUID, ValidateNested,} from 'class-validator';
import {PublicUser} from './PublicUser.ts';

export class GroupResponseMember {
	@Expose()
	@IsUUID()
	public id!: string;

	@Expose()
	@IsOptional()
	@IsString()
	public username?: string | null;

	@Expose()
	@IsOptional()
	@IsString()
	public image?: string | null;

	@Expose()
	@IsOptional()
	@IsBoolean()
	public isAdmin?: boolean;
}

export class GroupInviteResponse {
	@Expose()
	@ValidateNested()
	@Type(() => PublicUser)
	public createdBy!: PublicUser;

	@Expose()
	@ValidateNested()
	@Type(() => PublicUser)
	public user!: PublicUser;
}

export class GroupResponse {
	@Expose()
	@IsUUID()
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
	@IsBoolean()
	public isPublic!: boolean;

	@Expose()
	@IsBoolean()
	public membersCanInvite!: boolean;

	@Expose()
	@ValidateNested({ each: true })
	@Type(() => GroupResponseMember)
	public members!: GroupResponseMember[];

	@Expose()
	@ValidateNested({ each: true })
	@Type(() => GroupInviteResponse)
	public invites!: GroupInviteResponse[];

	@Expose()
	@ValidateNested()
	@Type(() => GroupResponseMember)
	public createdBy!: GroupResponseMember;
}
