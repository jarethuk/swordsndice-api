import { Expose } from 'class-transformer';
/* istanbul ignore file */
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGroupRequest {
	@Expose()
	@MaxLength(100)
	@IsString()
	public name!: string;

	@Expose()
	@IsOptional()
	@MaxLength(200)
	@IsString()
	public description?: string;

	@Expose()
	@IsOptional()
	@IsString()
	public image?: string;

	@Expose()
	@IsOptional()
	@IsBoolean()
	public isPublic?: boolean;

	@Expose()
	@IsOptional()
	@IsBoolean()
	public membersCanInvite?: boolean;
}
