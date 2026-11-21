import { MailJetProvider } from "../../pkg/email/mailJet";
import { NodemailerProvider } from "../../pkg/email/nodemailer";
import { env } from "../config/env";

export const nodemailerProvider = new NodemailerProvider({
  host: env.nodemailer.host,
  port: env.nodemailer.port,
  user: env.nodemailer.user,
  pass: env.nodemailer.pass,
  fromEmail: env.nodemailer.fromEmail,
});

export const mailjetProvider = new MailJetProvider({
  apiKey: env.mailJet.apiKey,
  apiSecret: env.mailJet.secretKey,
  fromEmail: env.mailJet.fromEmail,
  fromName: env.mailJet.fromName,
});
