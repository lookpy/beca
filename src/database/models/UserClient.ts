import { Schema, model } from "mongoose";

interface UserClientAttributes {
  name: string;
  email: string;
  password: string;
}

const kittySchema = new Schema<UserClientAttributes>({
  name: String,
  email: { type: String, unique: true },
  password: String,
})

export const UserClient = model('UserClient', kittySchema);
