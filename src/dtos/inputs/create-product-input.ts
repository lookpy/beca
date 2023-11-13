import { IsString } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType()
export class CreateProductInput {
  @IsString()
  @Field()
  titleInspection: string;

  @IsString()
  @Field()
  tokenOwner: string;

  @IsString()
  @Field()
  url_product: string;
}