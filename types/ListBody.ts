/* istanbul ignore file */
import { Expose, Type } from 'class-transformer';
import {
	IsArray,
	IsBoolean,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';

export class ListMemberEquipment {
	@Expose()
	@IsString()
	public name!: string;

	@Expose()
	@IsNumber()
	public points!: number;
}

export class ListMember {
	@Expose()
	@IsString()
	public id!: string;

	@Expose()
	@IsString()
	public name!: string;

	@Expose()
	@IsNumber()
	public points!: number;

	@Expose()
	@IsArray()
	@Type(() => ListMemberEquipment)
	public equipment!: ListMemberEquipment[];

	@Expose()
	@IsNumber()
	public amount!: number;

	@Expose()
	@IsString()
	public slot!: string;

	@Expose()
	@IsOptional()
	@IsString()
	public notes?: string;

	@Expose()
	@IsOptional()
	@IsArray()
	@IsNumber({}, { each: true })
	public remainingStats!: number[];
}

export class ListGroup {
	@Expose()
	@IsString()
	public id!: string;

	@Expose()
	@Type(() => ListMember)
	public leader!: ListMember;

	@Expose()
	@IsArray()
	@Type(() => ListMember)
	public members!: ListMember[];
}

export class ListBody {
	@Expose()
	@IsOptional()
	@IsString()
	public id?: string;

	@Expose()
	@IsString()
	public name!: string;

	@Expose()
	@IsString()
	public game!: string;

	@Expose()
	@IsString()
	public army!: string;

	@Expose()
	@IsNumber()
	public points!: number;

	@Expose()
	@IsNumber()
	public actualPoints!: number;

	@Expose()
	@IsOptional()
	@IsString()
	public image?: string | null;

	@Expose()
	@IsOptional()
	@IsString()
	public description?: string | null;

	@Expose()
	@IsOptional()
	@IsBoolean()
	public isDeleted?: boolean | null;

	@Expose()
	@IsArray()
	@Type(() => ListGroup)
	public groups!: ListGroup[];
}
