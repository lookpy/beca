import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { DataUserModel } from "../dtos/models/data-user-models";
import { CreateDataUserInput } from "../dtos/inputs/create-data-user-input";
import { DataUser } from "../database/models/DataUser";
import { UpdateDataUserInput } from "../dtos/inputs/update-data-user-input";

@Resolver(() => DataUserModel)
export class DataUserResolver {
  @Query(() => [DataUserModel])
  async dataUser(@Arg('slug') slug: string) {
    const dataUsers = await DataUser.find({ slug: slug});

    if (!dataUsers) { throw new Error("Page not found") }


    const dataUser = dataUsers.map((item) => {
      return {
        id: item._id,
        ip: item.ip,
        slug: item.slug,
        currentDateTime: item.currentDateTime,
        geoLocation: item.geoLocation,
        video: item.video,
        screenshot: item.screenshot,
      }
    });

    return dataUser
  }
  @Mutation(() => DataUserModel)
  async createDataUser(@Arg('data') data: CreateDataUserInput) {
    const dataUserData = {
      ip: data.ip,
      slug: data.slug,
      currentDateTime: data.currentDateTime,
      geoLocation: data.geoLocation,
      video: data.video,
      screenshot: data.screenshot,
    }

    const dataUser = new DataUser(dataUserData);

    try {

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
        { $set: {
          geoLocation: data.geoLocation,
          video: data.video,
          screenshot: data.screenshot,
          currentDateTime: data.currentDateTime,
          ip: data.ip,
        } },
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