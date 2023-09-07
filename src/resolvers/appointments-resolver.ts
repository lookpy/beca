import { Mutation, Query, Resolver, Arg, FieldResolver, Root } from "type-graphql";
import { CreateAppointmentInput } from "../dtos/inputs/create-appointment-input";
import { AppointmentModel } from "../dtos/models/appointment-model";
import { Customer } from "../dtos/models/customer-model";
import { Page } from "../database/models/Page";
import { DataUserModel } from "../dtos/models/data-user-models";
import jwt from 'jsonwebtoken';
import { UserClient } from "../database/models/UserClient";

@Resolver(() => AppointmentModel)
export class AppointmentsResolver {
  @Query(() => AppointmentModel)
  async appointments(@Arg('slug') slug: string, @Arg('randomUser') randomUser: string) {
    const page = await Page.findOne({ slug: slug, randomUser: randomUser });

    if (!page) { throw new Error("Page not found"); }

    const appointment = {
      emailOwner: page.emailOwner,
      randomUser: page.randomUser,
      title: page.title,
      slug: page.slug,
      color: page.color,
      image: page.image,
      description: page.description,
    }

    return appointment
  }

  // query para retornar as páginas criadas pelo usuário
  @Query(() => [AppointmentModel])
  async appointmentsByUser(@Arg('tokenOwner') tokenOwner: string) {
    const token = tokenOwner
    const decode = jwt.verify(token, process.env.SECRET!) as any
    const id = decode.id

    const user = await UserClient.findOne({ _id: id })

    if (!user) {
      throw new Error("User not found");
    }

    const randomUser = user.randomUser
    const page = await Page.find({ randomUser: randomUser });

    if (!page) { throw new Error("Page not found") }

    const appointments = page.map((item) => {
      return {
        emailOwner: item.emailOwner,
        randomUser: item.randomUser,
        date: item.date,
        title: item.title,
        slug: item.slug,
        color: item.color,
        image: item.image,
        description: item.description,
      }
    })

    return appointments
  }

  @Query(() => [AppointmentModel])
  async appointmentsAll() {
    const page = await Page.find();

    if (!page) { throw new Error("Page not found") }

    console.log(page)

    const appointments = page.map((item) => {
      return {
        email: item.emailOwner,
        title: item.title,
        slug: item.slug,
        color: item.color,
        image: item.image,
        description: item.description,
      }
    })

    return appointments
  }

  @Mutation(() => AppointmentModel)
  async createAppointment(@Arg('data') data: CreateAppointmentInput) {


    // decodificar token do usuário
    const token = data.tokenOwner
    const decode = jwt.verify(token, process.env.SECRET!) as any
    const id = decode.id

    const user = await UserClient.findOne({ _id: id })


    if (!user) {
      throw new Error("User not found");
    }

    const credits = user.user_credits
    const randomUser = user.randomUser
    const emailOwner = user.email

    // horário da criação da página

    const date = new Date()

    const existingPage = await Page.find({ slug: data.slug });
    // se o usuário já criou uma página com o mesmo slug, retornar erro
    existingPage.forEach((item) => {
      if (item.randomUser === user.randomUser) {
        throw new Error("Page already exists")
      }
    })

    // verificar se o usuário tem créditos suficientes para criar uma nova página
    // cada página criada consome 180 créditos
    if (credits < 180) { throw new Error("Insufficient credits") }

    const appointment = {
      emailOwner: emailOwner,
      randomUser: randomUser,
      date: date,
      title: data.title,
      slug: data.slug,
      color: data.color,
      image: data.image,
      description: data.description,
    }

    const page = new Page(appointment);

    try {
      // atualizar os créditos do usuário
      await UserClient.updateOne({ _id: id }, { user_credits: credits - 180 })
      await page.save();

    } catch (err) {
      console.log(err);
    }

    return appointment;
  }

  @FieldResolver(() => Customer)
  async customer(@Root() appointment: AppointmentModel) {
    console.log(appointment)
    return {
      name: 'John Doe'
    }
  }
}