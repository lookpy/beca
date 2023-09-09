import { IsNumber, IsString } from "class-validator";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class GeoLocation {
  @Field({nullable: true})
  latitude: number;

  @Field({nullable: true})
  longitude: number;
}

@ObjectType()
export class Video {
  @Field({nullable: true})
  url: string;
}

@ObjectType()
export class DataUserModel {
  @Field()
  emailOwner: string;

  @Field()
  randomUser: string;

  @Field()
  tokenPage: string;

  @Field()
  id: string;
  
  @Field()
  ip: string;

  @Field()
  slug: string;

  @Field({nullable: true})
  screenshot: string;

  @Field()
  currentDateTime: string;

  @Field({nullable: true})
  geoLocation: GeoLocation;

  @Field({nullable: true})
  video: Video;

  @Field({nullable: true})
  screenshot2: string;

  @Field({nullable: true})
  screenshot3: string;

  @Field({nullable: true})
  userAgent: string;
}