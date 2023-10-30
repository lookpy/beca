import { Schema, model } from "mongoose";

interface DataUserAttributes {
  emailOwner: string;
  randomUser: string;
  tokenPage: String,
  ip: string;
  slug: string;
  currentDateTime: string;
  geoLocation: {
    latitude: number;
    longitude: number;
  };
  video: {
    url: string;
  };
  screenshot: string;
  screenshot2: string;
  screenshot3: string;
  userAgent: string;
  viewed: boolean;
}

const kittySchema = new Schema<DataUserAttributes>({
  emailOwner: String,
  randomUser: String,
  tokenPage: String,
  ip: String,
  slug: String,
  currentDateTime: String,
  geoLocation: {
    latitude: Number,
    longitude: Number,
  },
  video: {
    url: String,
  },
  screenshot: String,
  screenshot2: String,
  screenshot3: String,
  userAgent: String,
  viewed: { type: Boolean, default: false}
})

export const DataUser = model('DataUser', kittySchema);