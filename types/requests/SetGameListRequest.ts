/* istanbul ignore file */
import {Expose, Type} from 'class-transformer';
import {ValidateNested} from 'class-validator';
import {ListBody} from '../ListBody.ts';

export class SetGameListRequest {
	@ValidateNested()
	@Type(() => ListBody)
	@Expose()
	public list!: ListBody;
}
