import { IsOptional, IsString } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class CreateAppointmentInput {
  @IsString()
  @Field()
  titleInspection: string;
  
  @IsString()
  @Field()
  tokenOwner: string;

  @IsString()
  @Field()
  title: string;

  @IsString()
  @Field()
  slug: string;

  @IsString()
  @Field()
  color: string;

  @IsString()
  @Field()
  image: string;

  @IsString()
  @Field()
  description: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  url_product?: string;
}