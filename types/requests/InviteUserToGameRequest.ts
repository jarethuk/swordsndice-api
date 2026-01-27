import { Expose } from 'class-transformer';
/* istanbul ignore file */
import { IsString } from 'class-validator';

export class InviteUserToGameRequest {
	@Expose()
	@IsString()
	public friendId!: string;
}
