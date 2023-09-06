import { Schema, model } from "mongoose";

interface PageAttributes {
  emailOwner: string;
  randomUser: string;
  title: string;
  slug: string;
  color: string;
  image: string;
  description: string;
  date: Date;
}

const kittySchema = new Schema<PageAttributes>({
  emailOwner: String,
  randomUser: String,
  date: Date,
  title: String,
  slug: String,
  color: String,
  image: String,
  description: String,
})

export const Page = model('Page', kittySchema);