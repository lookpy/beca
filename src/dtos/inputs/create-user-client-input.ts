import { IsEmail, IsString } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class CreateUserClientInput {
  @IsString()
  @Field()
  name: string;

  @IsEmail()
  @Field()
  email: string;

  @IsString()
  @Field()
  password: string;
}

@InputType()
export class LoginUserClientInput {
  @IsString()
  @Field()
  email: string;

  @IsString()
  @Field()
  password: string;
}