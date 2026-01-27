import { Expose } from 'class-transformer';
/* istanbul ignore file */
import { IsBoolean } from 'class-validator';

export class BasicResponse {
	@IsBoolean()
	@Expose()
	public success!: boolean;
}
