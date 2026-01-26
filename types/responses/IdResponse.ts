/* istanbul ignore file */
import {Expose} from 'class-transformer';
import {IsString} from 'class-validator';

export class IdResponse {
	@IsString()
	@Expose()
	public id!: string;
}
