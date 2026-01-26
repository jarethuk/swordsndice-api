import {Expose} from 'class-transformer';
/* istanbul ignore file */
import {IsOptional, IsString} from 'class-validator';

export class UserResponse {
	@IsString()
	@Expose()
	public id!: string;

	@IsString()
	@Expose()
	public email!: string;

	@IsString()
	@IsOptional()
	@Expose()
	public username?: string | null;

	@IsString()
	@IsOptional()
	@Expose()
	public image?: string | null;
}
