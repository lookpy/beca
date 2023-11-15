import { IsOptional, IsString } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class UpdateUserPasswordInput {
  @Field()
  @IsString()
  email: string;
}