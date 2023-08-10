import { IsDate, IsNumber, IsString } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class CreateAppointmentInput {
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
}