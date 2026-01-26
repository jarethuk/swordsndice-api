/* istanbul ignore file */
import {Expose} from 'class-transformer';
import {IsString} from 'class-validator';

export class InviteToGroupRequest {
	@Expose()
	@IsString()
	public friendId!: string;
}
