import { NodemailerProvider } from "../../pkg/email/nodemailer";
import { env } from "../config/env";

export const nodemailerProvider = new NodemailerProvider({
  host: env.nodemailer.host,
  port: env.nodemailer.port,
  user: env.nodemailer.user,
  pass: env.nodemailer.pass,
  fromEmail: env.nodemailer.fromEmail,
});
