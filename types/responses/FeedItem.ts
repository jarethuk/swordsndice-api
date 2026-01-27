import { Expose } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

export const FeedItemTypes = {
	GameStarted: 'Game Started',
	GameCompleted: 'Game Completed',
	GroupJoined: 'Group Joined',
	GroupCreated: 'Group Created',
	FriendAdded: 'Friend Added',
};

export type FeedItemType = (typeof FeedItemTypes)[keyof typeof FeedItemTypes];

export class FeedItem {
	@Expose()
	@IsString()
	public id!: string;

	@Expose()
	@IsEnum(FeedItemTypes)
	public type!: FeedItemType;

	@Expose()
	@IsDate()
	public date!: Date;

	@Expose()
	@IsString()
	public title!: string;

	@Expose()
	@IsOptional()
	@IsString()
	public subTitle?: string;

	@Expose()
	@IsOptional()
	@IsString()
	public image?: string;
}
