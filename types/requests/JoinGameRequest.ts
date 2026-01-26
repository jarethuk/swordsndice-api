import {Expose} from 'class-transformer';
/* istanbul ignore file */
import {IsString} from 'class-validator';

export class JoinGameRequest {
	@Expose()
	@IsString()
	public inviteCode!: string;
}
