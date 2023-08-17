import { IsDate, IsNumber, IsObject, IsString } from "class-validator";
import { Field, InputType, ObjectType } from "type-graphql";

@InputType()
export class GeoLocationInput {
  @IsNumber()
  @Field()
  latitude: number;

  @IsNumber()
  @Field()
  longitude: number;
}

@InputType()
export class VideoInput {
  @IsString()
  @Field()
  url: string;
}

@InputType()
export class CreateDataUserInput {
  @IsString()
  @Field()
  ip: string;

  @IsString()
  @Field()
  slug: string;

  @IsString()
  @Field()
  currentDateTime: string;

  @IsObject()
  @Field(() => GeoLocationInput)
  geoLocation: GeoLocationInput;

  @Field(() => VideoInput)
  video: VideoInput;

  @IsString()
  @Field()
  screenshot: string;
}