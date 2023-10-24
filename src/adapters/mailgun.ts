import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);

const mg = mailgun.client({username: 'sandbox1bc4fca8038c4420a19bec324ae58b05.mailgun.org', key: process.env.MAILGUN_API_KEY || 'key-yourkeyhere'});