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
import crypto from "crypto";
import { Recharges } from "./database/models/Recharges";
import {v2 as cloudinary} from 'cloudinary';
import { DataUser } from "./database/models/DataUser";
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

  app.post("/converter", async (req, res) => {
    const { videoUrl, id } = req.body;
    cloudinary.config({ 
      cloud_name: 'dbtvdo4uy', 
      api_key: '537964771777874', 
      api_secret: 'NF0_3tWXRr6twalYNM-tJRroxlo' 
    });

    if (!videoUrl) {
      return res.status(400).json({ error: 'É necessário fornecer uma URL de vídeo.' });
    }

    async function converterVideo(videoUrl: string) {
      try {
        const result = await cloudinary.uploader.upload(videoUrl, {
          resource_type: 'video',
          format: 'mp4'
        });
        return result.secure_url;
      } catch (error) {
        console.error('Erro ao converter o vídeo:', error);
        throw error;
      }
    }

    try {
      const videoConverted = await converterVideo(videoUrl);

      // atualizar o banco de dados o video mp4
      const dataUser = await DataUser.findOneAndUpdate({ _id: id }, { $set: { videoMp4: { url: videoConverted } } }, { new: true });

      res.json({ videoConverted });
    } catch (error) {
      console.error('Erro ao converter o vídeo:', error);
      res.status(500).json({ error: 'Erro ao converter o vídeo.' });
    }
  })

  app.post(
    "/yampi",
    // Use body-parser to retrieve the raw body as a buffer.
    bodyParser.raw({ type: "application/json" }),
    async (req: express.Request, res: express.Response): Promise<void> => {
      const signature = req.get('X-Yampi-Hmac-SHA256');
      const hmac = crypto.createHmac('sha256', process.env.YAMPI_WEBHOOK_SECRET!);
      hmac.update(req.body);
      const calculatedSignature = hmac.digest('base64');

      if (signature === calculatedSignature) {
        console.log('Yampi webhook signature verified');
      }

      const data = req.body;

      console.log(data);

      if (data.event === "order.paid") {
        const email = data.resource.customer.data.email
        const value = data.resource.value_total
        const idTransaction = data.resource.id
        const time = data.time

        // verificar se o idTransaction já existe no banco de dados
        const findTransaction = await Recharges.findOne({ idTransaction });

        if (findTransaction) {
          console.log('Transação já existe no banco de dados');
          res.sendStatus(200);
          return;
        }

        if (value === 59.99) {
          // adicionar mais 1000 créditos
          const updateCredits = await UserClient.findOneAndUpdate({ email }, { $inc: { user_credits: 1000 } }, { new: true });

          // salvar no banco de dados
          const recharge = new Recharges({ email, time, idTransaction, value });
        }

        if (value === 212.99) {
          // adicionar mais 3000 créditos
          const updateCredits = await UserClient.findOneAndUpdate({ email }, { $inc: { user_credits: 3000 } }, { new: true });

          // salvar no banco de dados
          const recharge = new Recharges({ email, time, idTransaction, value });
        }

        if (value === 426.99) {
          // adicionar mais 6000 créditos
          const updateCredits = await UserClient.findOneAndUpdate({ email }, { $inc: { user_credits: 6000 } }, { new: true });

          // salvar no banco de dados
          const recharge = new Recharges({ email, time, idTransaction, value });
        }

        if (value === 852.99) {
          // adicionar mais 12000 créditos
          const updateCredits = await UserClient.findOneAndUpdate({ email }, { $inc: { user_credits: 12000 } }, { new: true });

          // salvar no banco de dados
          const recharge = new Recharges({ email, time, idTransaction, value });
        }
      }

      res.sendStatus(200);
    })

  app.post("/previewpage", express.json(), async (req, res) => {
    const data = req.body

    const url = data.url;

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
  })

  app.post('/load-local-images', async (req, res) => {
    try {
      const fetchImagePromises = req.body.images.map(async (image: string) => {
        const response = await axios.get(image, {
          responseType: 'arraybuffer',
        });
        const imageBuffer = Buffer.from(response.data, 'binary');
        const base64Image = imageBuffer.toString('base64');

        return `data:${response.headers['content-type']};base64,${base64Image}`;
      });

      const images = await Promise.all(fetchImagePromises);
      res.json({ images });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: 'Error fetching images' });
    }
  });

  // rotar para salvar o token para enviar notificação pelo browser
  app.post('/save-token', express.json(), async (req, res) => {
    const data = req.body

    const token = data.token

    const email = data.email

    // verificar se o usuário existe
    const userClient = await UserClient.findOne({ email: email })

    if (!userClient) {
      res.status(500).json({ success: false, message: 'User not found' });
      return;
    }

    if (userClient.tokenNotification === token) {
      res.status(200).json({ success: true, message: 'Token already saved: ' + userClient.tokenNotification });
      return;
    }

    // salvar o token no banco de dados
    userClient.tokenNotification = token

    await userClient.save()

    res.status(200).json({ success: true, message: 'Token saved' });
  })
}

bootstrap();