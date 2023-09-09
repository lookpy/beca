import { IsDate, IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import { Field, InputType, ObjectType } from "type-graphql";

@InputType()
export class GeoLocationInput {
  @IsOptional()
  @IsNumber()
  @Field({nullable: true})
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Field({nullable: true})
  longitude?: number;
}

@InputType()
export class VideoInput {
  @IsString()
  @Field({nullable: true})
  url?: string;
}

@InputType()
export class CreateDataUserInput {
  // colocar como opcional
  @IsString()
  @Field()
  randomUser: string;

  @IsString()
  @Field()
  tokenPage: string;

  @IsOptional()
  @IsString()
  @Field({nullable: true})
  ip?: string;

  @IsString()
  @Field()
  slug: string;

  @IsOptional()
  @IsString()
  @Field({nullable: true})
  screenshot?: string;

  @IsOptional()
  @IsString()
  @Field({nullable: true})
  currentDateTime?: string;

  @IsOptional()
  @IsObject()
  @Field({nullable: true})
  geoLocation?: GeoLocationInput;

  @IsOptional()
  @Field({nullable: true})
  video?: VideoInput;

  @IsOptional()
  @IsString()
  @Field({nullable: true})
  screenshot2?: string;

  @IsOptional()
  @IsString()
  @Field({nullable: true})
  screenshot3?: string;

  @IsOptional()
  @IsString()
  @Field({nullable: true})
  userAgent?: string;
}