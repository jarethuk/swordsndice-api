/* istanbul ignore file */
import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginRequest {
	@IsEmail(
		{},
		{
			message: 'Invalid email address',
		},
	)
	@Transform(({ value }) => value.toLowerCase())
	@Expose()
	public email!: string;

	@IsString()
	@IsOptional()
	@Expose()
	public code?: string;
}
