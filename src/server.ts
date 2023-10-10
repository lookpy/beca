import { ApolloServer } from "apollo-server-express";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { AppointmentsResolver } from "./resolvers/appointments-resolver";
import path from 'node:path'
import mongoose from "mongoose";
import dotenv from "dotenv";
import { DataUserResolver } from "./resolvers/data-user-resolver";
import { UserClientResolver } from "./resolvers/user-client-resolver";
import express from "express";
import cors from "cors";
import axios from "axios";
dotenv.config();

async function bootstrap() {
  const app = express();
  const MONGO_URL = process.env.MONGO_URL!;

  app.use(cors());
  app.use(express.json());

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
  })

  await server.start();

  server.applyMiddleware({ app });
  
  app.listen({port : process.env.PORT || 4000}, () => {
    console.log(`🚀 Server ready at http://localhost:${process.env.PORT || 4000}${server.graphqlPath}`)
  })

  app.use('/page', async (req, res) => {
    const url = req.body.data;

    try {
      const userAgent = req.headers['user-agent'];
      const response = await axios.get(url, {
        headers: {
          // headers de um smartphone
          'User-Agent': userAgent,
        }
      });
      
      const data = response.data;
      res.send(data);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao buscar dados do servidor');
    }
  });

  // webhook da yampi
  app.use('/webhook', async (req, res) => {
    const { data } = req.body;

    if (data) {
      console.log('webhook recebido', data);
    }

    res.send('ok');
  });
}

bootstrap();