import {Expose} from 'class-transformer';
/* istanbul ignore file */
import {IsOptional, IsString} from 'class-validator';

export class GroupSearchResult {
	@Expose()
	@IsString()
	public id!: string;

	@Expose()
	@IsString()
	public name!: string;

	@Expose()
	@IsOptional()
	@IsString()
	public description?: string;

	@Expose()
	@IsOptional()
	@IsString()
	public image?: string;
}
