import { Schema, model } from "mongoose";

interface UserClientAttributes {
  name: string;
  email: string;
  password: string;
  user_credits: number;
  randomUser: string;
  // campo para token para enviar notificações
  tokenNotification?: string;
}

const kittySchema = new Schema<UserClientAttributes>({
  name: String,
  email: { type: String, unique: true },
  password: String,
  user_credits: { type: Number, default: 5000 },
  randomUser: String,
  tokenNotification: String
})

export const UserClient = model('UserClient', kittySchema);
