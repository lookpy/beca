import { Schema, model } from "mongoose";

interface PageAttributes {
  titleInspection: string;
  emailOwner: string;
  tokenPage: string;
  randomUser: string;
  title: string;
  slug: string;
  color: string;
  image: string;
  description: string;
  date: Date;
  url_product: string;
}

const kittySchema = new Schema<PageAttributes>({
  titleInspection: String,
  emailOwner: String,
  tokenPage: String,
  randomUser: String,
  date: Date,
  title: String,
  slug: String,
  color: String,
  image: String,
  description: String,
  url_product: String,
})

export const Page = model('Page', kittySchema);