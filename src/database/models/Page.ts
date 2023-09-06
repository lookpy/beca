import { Schema, model } from "mongoose";

interface PageAttributes {
  emailOwner: string;
  randomUser: string;
  title: string;
  slug: string;
  color: string;
  image: string;
  description: string;
}

const kittySchema = new Schema<PageAttributes>({
  emailOwner: String,
  randomUser: String,
  title: String,
  slug: String,
  color: String,
  image: String,
  description: String,
})

export const Page = model('Page', kittySchema);