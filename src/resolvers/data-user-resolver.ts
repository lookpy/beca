import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { DataUserModel } from "../dtos/models/data-user-models";
import { CreateDataUserInput } from "../dtos/inputs/create-data-user-input";
import { DataUser } from "../database/models/DataUser";

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
      dataUser.save();

    } catch (error) {

      console.log(error)
    }
    return dataUserData;
  }
}