import { Arg, Mutation, Query, Resolver } from "type-graphql";
import bcrypt from 'bcrypt';
import { UserClient } from "../database/models/UserClient";
import jwt from 'jsonwebtoken';
import { DataUserClientModel, Token } from "../dtos/models/user-client-models";
import { CreateUserClientInput, LoginUserClientInput } from "../dtos/inputs/create-user-client-input";
import { UpdateUserPasswordInput } from "../dtos/inputs/update-user-password";
import { UpdateUserPasswordModel } from "../dtos/models/user-client-models";
import { sendEmail } from "../adapters/mailgun";
import crypto from 'crypto';

@Resolver()
export class UserClientResolver {
  @Mutation(() => Token)
  async CreateUserClient(@Arg('data') data: CreateUserClientInput) {
    const existingUser = await UserClient.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // criar um usuário não identificável para colocar no slug com 6 caracteres não usar caracteres que mexam com a url
    const randomUser = Math.random().toString(36).substring(2, 8)

    const userClient = await UserClient.create({
      name: data.name,
      email: data.email,
      password: bcrypt.hashSync(data.password, 10),
      randomUser: randomUser
    })

    try {
      const token = jwt.sign({ id: userClient._id }, process.env.SECRET!, {
        // expira em 30 dias
        expiresIn: 86400 * 30
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
        // expira em 30 dias
        expiresIn: 86400 * 30
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

  // pegar os dados do usuário pelo token
  @Query(() => DataUserClientModel)
  async DataUserClient(@Arg('token') token: string) {
    // decodificar token do usuário
    const decode = jwt.verify(token, process.env.SECRET!) as any

    const id = decode.id

    if (!id) {
      throw new Error('Token invalid')
    }

    const client = await UserClient.findOne({ _id: id })

    if (!client) {
      throw new Error('User not found')
    }

    const dataUserClient = {
      name: client.name,
      email: client.email,
      user_credits: client.user_credits,
      randomUser: client.randomUser
    } as DataUserClientModel

    return dataUserClient
  }

  // atualizar os créditos do usuário pelo email
  @Mutation(() => DataUserClientModel)
  async UpdateUserCredits(@Arg('email') email: string, @Arg('credits') credits: number) {
    const client = await UserClient.findOne({ email: email })

    if (!client) {
      throw new Error('User not found')
    }

    const creditsTotal = client.user_credits + credits

    client.user_credits = creditsTotal

    await client.save()

    const dataUserClient = {
      name: client.name,
      email: client.email,
      user_credits: client.user_credits,
      randomUser: client.randomUser
    } as DataUserClientModel

    return dataUserClient
  }

  // enviar para o usuário um link no email para ele atualizar a senha
  @Mutation(() => Boolean)
  async UpdateUserPassword(@Arg('data') data: UpdateUserPasswordInput) {
    const email = data.email

    // Gerar um token exclusivo para redefinição de senha
    const resetToken = crypto.randomBytes(20).toString('hex');


    // Salvar o token no banco de dados ou em algum lugar seguro associado ao usuário
    const user = await UserClient.findOne({ email: email });
    if (!user) {
      throw new Error('User not found')
    }

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token válido por 1 hora (em milissegundos)
    await user.save();

    // Agora você pode incluir o token no link de redefinição de senha
    const resetLink = `https://www.abrir.ink/reset-password/${resetToken}`;

    // Enviar o link por e-mail
    const emailSubject = 'Redefinição de Senha';
    const emailBody = `Clique no seguinte link para redefinir sua senha: ${resetLink}`;

    try {
      await sendEmail(email, emailSubject, emailBody);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  @Mutation(() => Boolean)
  async ResetPassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string
  ) {
    const user = await UserClient.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // Verificar se o token ainda é válido
    });

    if (!user) {
      throw new Error('Token inválido ou expirado. Solicite novamente a redefinição de senha.');
    }

    // Atualizar a senha do usuário
    user.password = bcrypt.hashSync(newPassword, 10);
    
    // Limpar as informações de redefinição de senha após a alteração bem-sucedida
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    // Salvar as alterações no banco de dados
    await user.save();

    return true;
  }

  // login admin
  @Mutation(() => Token)
  async LoginAdmin(@Arg('password') password: string) {
    if (password !== process.env.PASSWORD_ADMIN) {
      throw new Error('Password incorrect')
    }

    try {
      const token = jwt.sign({ id: 'admin' }, process.env.SECRET!, {
        // expira em 30 dias
        expiresIn: 86400 * 30
      })

      return { token }
    }
    catch (err) {
      console.log(err)
      throw new Error('Error to login user')
    }
  }

  // listar todos os usuários
  @Query(() => [DataUserClientModel])
  async ListAllUserClient() {
    const clients = await UserClient.find()

    const dataUserClient = clients.map((client) => {
      return {
        name: client.name,
        email: client.email,
        user_credits: client.user_credits,
        randomUser: client.randomUser,
        tokenNotification: client.tokenNotification
      } as DataUserClientModel
    })

    return dataUserClient
  }
}