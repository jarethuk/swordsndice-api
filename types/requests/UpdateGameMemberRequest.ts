/* istanbul ignore file */
import { Expose } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateGameMemberRequest {
	@IsInt()
	@IsOptional()
	@Expose()
	public points!: number;

	@IsInt()
	@IsOptional()
	@Expose()
	public modelCount!: number;

	@IsInt()
	@IsOptional()
	@Expose()
	public modelCountRemaining!: number;
}
