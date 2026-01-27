/* istanbul ignore file */
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class CancelInviteToGroupRequest {
	@Expose()
	@IsString()
	public friendId!: string;
}
