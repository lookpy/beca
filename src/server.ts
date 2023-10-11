import { ApolloServer } from "apollo-server-express";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { AppointmentsResolver } from "./resolvers/appointments-resolver";
import path from 'path'
import mongoose from "mongoose";
import dotenv from "dotenv";
import { DataUserResolver } from "./resolvers/data-user-resolver";
import { UserClientResolver } from "./resolvers/user-client-resolver";
import express from "express";
import cors from "cors";
import axios from "axios";
import Stripe from "stripe";
import bodyParser from "body-parser";
import { UserClient } from "./database/models/UserClient";
dotenv.config();

interface PaymentIntentTotal extends Stripe.PaymentIntent {
  charges: {
    data: {
      amount: number;
      billing_details: {
        address: {
          city: string;
          country: string;
          line1: string;
          line2: string;
          postal_code: string;
          state: string;
        };
        email: string;
        name: string;
        phone: string;
      };
    }[];
  }
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-08-16",
  typescript: true,
});


async function bootstrap() {
  const app = express();
  const MONGO_URL = process.env.MONGO_URL!;

  app.use(cors());

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

  app.listen({ port: process.env.PORT || 4000 }, () => {
    console.log(`🚀 Server ready at http://localhost:${process.env.PORT || 4000}${server.graphqlPath}`)
  })

  app.use('/page', express.json(), async (req, res) => {
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

  app.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ): void => {
      if (req.originalUrl === '/webhook') {
        next();
      } else {
        express.json()(req, res, next);
      }
    }
  );

  app.post(
    "/webhook",
    // Use body-parser to retrieve the raw body as a buffer.
    bodyParser.raw({ type: "application/json" }),
    async (req: express.Request, res: express.Response): Promise<void> => {
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          req.headers["stripe-signature"]!,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      } catch (err) {
        console.log(err)
        console.log(`⚠️  Webhook signature verification failed.`);
        res.sendStatus(400);
        return;
      }

      // Extract the data from the event.
      const data: Stripe.Event.Data = event.data;
      const eventType: string = event.type;

      console.log(data);

      if (eventType === "payment_intent.succeeded") {
        // Cast the event into a PaymentIntent to make use of the types.
        const pi: PaymentIntentTotal = data.object as PaymentIntentTotal
        // Funds have been captured
        // Fulfill any orders, e-mail receipts, etc
        // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds).
        // valor em centavos
        const amount = pi.amount;

        // Recupera as cobranças associadas ao payment_intent

        if (amount === 1000) {
          // adicionar mais 500 créditos
          const charges = await stripe.charges.list(
            { payment_intent: pi.id },
          );
          // Aqui você pode acessar as informações de billing_details
          const billingDetails = charges.data[0].billing_details;
          const email = billingDetails.email;
          const updateCredits = await UserClient.findOneAndUpdate({ email }, { $inc: { user_credits: 500 } }, { new: true });

          console.log(updateCredits);
        }

        if (amount === 1800) {
          // adicionar mais 1000 créditos
          const charges = await stripe.charges.list(
            { payment_intent: pi.id },
          );
          // Aqui você pode acessar as informações de billing_details
          const billingDetails = charges.data[0].billing_details;
          const email = billingDetails.email;
          const updateCredits = await UserClient.findOneAndUpdate({ email }, { $inc: { user_credits: 1000 } }, { new: true });

          console.log(updateCredits);
        }

        // atualizar o banco de dados os créditos do usuário
        console.log(`🔔  Webhook received: ${pi.object} ${pi.status}!`);
        console.log("💰 Payment captured!");
      } else if (eventType === "payment_intent.payment_failed") {
        // Cast the event into a PaymentIntent to make use of the types.
        const pi: Stripe.PaymentIntent = data.object as Stripe.PaymentIntent;
        console.log(`🔔  Webhook received: ${pi.object} ${pi.status}!`);
        console.log("❌ Payment failed.");
      }
      res.sendStatus(200);
    }
  );
}

bootstrap();