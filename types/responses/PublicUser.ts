/* istanbul ignore file */
import {Expose} from 'class-transformer';
import {IsBoolean, IsNotEmpty, IsOptional, IsString} from 'class-validator';

export class PublicUser {
	@Expose()
	@IsNotEmpty()
	@IsString()
	public id!: string;

	@Expose()
	@IsString()
	public username!: string;

	@Expose()
	@IsOptional()
	@IsString()
	public image?: string | null;

	@Expose()
	@IsOptional()
	@IsBoolean()
	public isFriend?: boolean;

	@Expose()
	@IsOptional()
	@IsString()
	public description?: string | null;
}
