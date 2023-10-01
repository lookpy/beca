import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { DataUserModel } from "../dtos/models/data-user-models";
import { CreateDataUserInput } from "../dtos/inputs/create-data-user-input";
import { DataUser } from "../database/models/DataUser";
import { UpdateDataUserInput } from "../dtos/inputs/update-data-user-input";
import jwt from 'jsonwebtoken';
import { UserClient } from "../database/models/UserClient";

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

    try {
      // atualizar os créditos do usuário
      await dataUser.save()

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
      }
    });

    return dataUser
  }
}