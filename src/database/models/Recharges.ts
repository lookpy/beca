import { Schema, model } from "mongoose";

interface RechargesAttributes {
  email: string;
  time: number;
  idTransaction: number;
  value: number;
}

const kittySchema = new Schema<RechargesAttributes>({
  idTransaction: { type: Number, unique: true },
  email: String,
  time: Number,
  value: Number,
})

export const Recharges = model('Recharges', kittySchema);