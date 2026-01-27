/* istanbul ignore file */
import { Expose, Type } from 'class-transformer';
import { IsDate, IsNumber, IsString, ValidateNested } from 'class-validator';
import { PublicUser } from './PublicUser';

export class GameInviteResponse {
	@Expose()
	@IsString()
	public id!: string;

	@Expose()
	@IsDate()
	public createdAt!: Date;

	@Expose()
	@ValidateNested()
	@Type(() => PublicUser)
	public invitedBy!: PublicUser;

	@Expose()
	@IsString()
	public game!: string;

	@Expose()
	@IsNumber()
	public points!: number;
}
