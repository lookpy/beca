import { Arg, Mutation, Resolver } from "type-graphql";
import bcrypt from 'bcrypt';
import { UserClient } from "../database/models/UserClient";
import jwt from 'jsonwebtoken';
import { Token } from "../dtos/models/user-client-models";
import { CreateUserClientInput, LoginUserClientInput } from "../dtos/inputs/create-user-client-input";

@Resolver()
export class UserClientResolver {
  @Mutation(() => Token)
  async CreateUserClient(@Arg('data') data: CreateUserClientInput) {
    const existingUser = await UserClient.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const userClient = await UserClient.create({
      name: data.name,
      email: data.email,
      password: bcrypt.hashSync(data.password, 10)
    })

    try {
      const token = jwt.sign({ id: userClient._id }, process.env.SECRET!, {
        expiresIn: 86400
      })

      return { token }
    }
    catch (err) {
      console.log(err)
      throw new Error('Error to create user')
    }
  }

  @Mutation(() => Token)
  async LoginUserClient(@Arg('data') data: LoginUserClientInput) {
    const findUserClient = await UserClient.findOne({ email: data.email })

    if (!findUserClient) {
      throw new Error('User not found')
    }

    const comparePassword = bcrypt.compareSync(data.password, findUserClient.password)

    if (!comparePassword) {
      throw new Error('Password incorrect')
    }

    try {
      const token = jwt.sign({ id: findUserClient._id }, process.env.SECRET!, {
        expiresIn: 86400
      })

      return { token }
    }
    catch (err) {
      console.log(err)
      throw new Error('Error to login user')
    }
  }

  // vericar se o token é valido

  @Mutation(() => Boolean)
  async VerifyToken(@Arg('token') token: string) {
    try {
      jwt.verify(token, process.env.SECRET!)
      return true
    }
    catch (err) {
      return false
    }
  }
}