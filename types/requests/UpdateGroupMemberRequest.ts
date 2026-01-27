/* istanbul ignore file */
import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateGroupMemberRequest {
	@Expose()
	@IsOptional()
	@IsBoolean()
	public isAdmin?: boolean;
}
