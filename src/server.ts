import { ApolloServer } from "apollo-server";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { AppointmentsResolver } from "./resolvers/appointments-resolver";
import path from 'node:path'
import mongoose from "mongoose";
import dotenv from "dotenv";
import { DataUserResolver } from "./resolvers/data-user-resolver";
import { UserClientResolver } from "./resolvers/user-client-resolver";

dotenv.config();

async function bootstrap() {
  const MONGO_URL = process.env.MONGO_URL!;

  await mongoose.connect(MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  
  const schema = await buildSchema({
    resolvers: [
      AppointmentsResolver,
      DataUserResolver,
      UserClientResolver
    ],
    emitSchemaFile: path.resolve(__dirname, 'schema.gql')
  })
  const server = new ApolloServer({
    schema,
    cors: {
      origin: '*',
    },
  })
  const { url } = await server.listen({ port: process.env.PORT || 4000 })

  console.log(`🚀  Server ready at ${url}`);
}

bootstrap();