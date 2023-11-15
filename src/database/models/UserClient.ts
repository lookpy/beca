import { Schema, model } from "mongoose";

interface UserClientAttributes {
  name: string;
  email: string;
  password: string;
  user_credits: number;
  randomUser: string;
  // campo para token para enviar notificações
  tokenNotification?: string;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | number | null;
}

const kittySchema = new Schema<UserClientAttributes>({
  name: String,
  email: { type: String, unique: true },
  password: String,
  user_credits: { type: Number, default: 0 },
  randomUser: String,
  tokenNotification: String,
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null }
})

export const UserClient = model('UserClient', kittySchema);
