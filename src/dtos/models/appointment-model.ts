import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class AppointmentModel {
  @Field({ nullable: true })
  emailOwner: string;

  @Field({ nullable: true })
  tokenPage: string;

  @Field({ nullable: true })
  randomUser: string;

  @Field({nullable: true})
  date: Date;
  
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