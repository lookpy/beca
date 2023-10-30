import formData from "form-data";
import Mailgun from "mailgun.js";
import dotenv from "dotenv";
dotenv.config();

const mailgun = new Mailgun(formData);
const API_KEY = process.env.MAILGUN_API_KEY!;

const mg = mailgun.client({ username: 'spyfake.com', key: API_KEY });

export const sendEmail = async (to: string, subject: string, html: string) => {
  const data = {
    from: 'spyfake.com <equipe@spyfake.com>',
    to,
    subject,
    html
  }

  await mg.messages.create("spyfake.com", data)
    .then(msg => console.log(msg))
    .catch(err => console.log(err))

  return true;
}