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
  
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  slug: string;

  @Field({ nullable: true })
  color: string;

  @Field({ nullable: true })
  image: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  url_product: string;
}