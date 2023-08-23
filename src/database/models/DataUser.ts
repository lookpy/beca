import { Schema, model } from "mongoose";

interface DataUserAttributes {
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
}

const kittySchema = new Schema<DataUserAttributes>({
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
})

export const DataUser = model('DataUser', kittySchema);