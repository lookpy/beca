import { IsNumber, IsString } from "class-validator";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class GeoLocation {
  @Field()
  latitude: number;

  @Field()
  longitude: number;
}

@ObjectType()
export class Video {
  @Field()
  url: string;
}

@ObjectType()
export class DataUserModel {
  @Field()
  id: string;
  
  @Field()
  ip: string;

  @Field()
  slug: string;

  @Field()
  currentDateTime: string;

  @Field()
  geoLocation: GeoLocation;

  @Field()
  video: Video;

  @Field()
  screenshot: string;
}