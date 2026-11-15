import "dotenv/config";
import { z } from "zod";
const schema = z.object({
  PORT: z.string().default("5000"),
  MONGODB_URL: z.string(),
  NODEMAILER_HOST: z.string(),
  NODEMAILER_USER: z.string().trim().toLowerCase(),
  NODEMAILER_PASS: z.string(),
  NOSEDMAILER_EMAIL: z.email(),
  NODEMAILER_PORT: z.string().default("587"),
  JWT_Access_SECRET: z.string(),
  JWT_Refresh_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  REDIS_PORT: z.string().default("6379"),
  REDIS_HOST: z.string(),
  REDIS_PASSWORD: z.string(),
  REDIS_URL: z.string(),
  MAILJET_API_KEY: z.string(),
  MAILJET_SECRET_KEY: z.string(),
  MAILJET_FROM_EMAIL: z.string().trim().toLowerCase(),
  MAILJET_FROM_NAME: z.string(),
});

const parsed = schema.parse(process.env);

export const env = {
  db: {
    url: parsed.MONGODB_URL,
  },
  redis: {
    host: parsed.REDIS_HOST,
    password: parsed.REDIS_PASSWORD,
    port: Number(parsed.REDIS_PORT),
    url: parsed.REDIS_URL,
  },
  google: {
    webClientId: parsed.GOOGLE_CLIENT_ID,
  },
  nodemailer: {
    host: parsed.NODEMAILER_HOST,
    user: parsed.NODEMAILER_USER,
    pass: parsed.NODEMAILER_PASS,
    fromEmail: parsed.NOSEDMAILER_EMAIL,
    port: Number(parsed.NODEMAILER_PORT),
  },
  mailJet: {
    apiKey: parsed.MAILJET_API_KEY,
    secretKey: parsed.MAILJET_SECRET_KEY,
    fromEmail: parsed.MAILJET_FROM_EMAIL,
    fromName: parsed.MAILJET_FROM_NAME,
  },
  jwt: {
    accessSecret: parsed.JWT_Access_SECRET,
    refreshSecret: parsed.JWT_Refresh_SECRET,
  },
  port: Number(parsed.PORT),
};
