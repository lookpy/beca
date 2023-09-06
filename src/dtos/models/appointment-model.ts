import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class AppointmentModel {
  @Field({ nullable: true })
  emailOwner: string;

  @Field({ nullable: true })
  randomUser: string;
  
  @Field()
  title: string;

  @Field()
  slug: string;

  @Field()
  color: string;

  @Field()
  image: string;

  @Field()
  description: string;
}