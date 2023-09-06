import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class DataUserClientModel {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  user_credits: number;
}

@ObjectType()
export class Token {
  @Field()
  token: string;
}