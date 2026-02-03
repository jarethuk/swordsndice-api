/* istanbul ignore file */
import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class GoogleLoginRequest {
	@IsString()
	@IsOptional()
	@Expose()
	public token?: string;

	@IsString()
	@IsOptional()
	@Expose()
	public code?: string;
}
