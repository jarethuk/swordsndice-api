import {Expose} from 'class-transformer'; /* istanbul ignore file */
import {IsBoolean, IsNumber, IsOptional, IsString, MaxLength} from 'class-validator';

export class UpdateGameRequest {
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
	@IsNumber()
	public points?: number;

	@Expose()
	@IsOptional()
	@IsBoolean()
	public isStarted?: boolean;

	@Expose()
	@IsOptional()
	@IsBoolean()
	public isComplete?: boolean;
}
