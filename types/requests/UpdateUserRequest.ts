import {Expose} from 'class-transformer';
import {IsOptional, IsString, MaxLength} from 'class-validator';

export class UpdateUserRequest {
	@Expose()
	@IsOptional()
	@MaxLength(20)
	@IsString()
	public username?: string;

	@Expose()
	@IsOptional()
	@MaxLength(200)
	@IsString()
	public description?: string;

	@Expose()
	@IsOptional()
	@IsString()
	public image?: string;

	@Expose() /* istanbul ignore file */

	@IsOptional()
	@IsString()
	@MaxLength(100)
	public email?: string;
}
