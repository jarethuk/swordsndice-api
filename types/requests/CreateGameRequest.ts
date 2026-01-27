import { Expose } from 'class-transformer';
/* istanbul ignore file */
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGameRequest {
	@Expose()
	@IsString()
	public game!: string;

	@Expose()
	@IsOptional()
	@IsString()
	public description?: string;

	@Expose()
	@IsOptional()
	@IsString()
	public image?: string;

	@Expose()
	@IsNumber()
	public points!: number;

	@Expose()
	@IsString()
	public inviteCode!: string;
}
