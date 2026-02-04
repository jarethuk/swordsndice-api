import { Expose } from 'class-transformer';
import {
	IsNumber,
	IsOptional,
	IsString,
	Max,
	MaxLength,
	Min,
} from 'class-validator';

export class CreateFeedbackRequest {
	@Expose()
	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(5)
	public rating?: number;

	@Expose()
	@IsOptional()
	@IsString()
	@MaxLength(1000)
	public message?: string;
}
