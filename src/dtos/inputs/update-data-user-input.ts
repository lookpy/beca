import { IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import { Field, InputType } from "type-graphql";
import { GeoLocationInput, VideoInput } from "./create-data-user-input";

@InputType()
export class UpdateDataUserInput {
  // colocar como opcional
  @IsString()
  @Field()
  id: string;

  @IsOptional()
  @IsString()
  @Field({nullable: true})
  ip?: string;

  @IsOptional()
  @IsString()
  @Field({nullable: true})
  slug?: string;

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
}