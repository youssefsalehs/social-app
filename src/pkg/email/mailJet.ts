import Mailjet from "node-mailjet";
import { MailProvider } from "./mail.interface";
interface IMailJetConfig {
  apiKey: string;
  apiSecret: string;
  fromEmail: string;
  fromName: string;
}
export class MailJetProvider implements MailProvider {
  private client: Mailjet;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(config: IMailJetConfig) {
    this.client = new Mailjet({
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
    });
    this.fromEmail = config.fromEmail;
    this.fromName = config.fromName;
  }
  send = async (email: string, subject: string, html: string) => {
    await this.client.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: this.fromEmail,
            Name: this.fromName,
          },
          To: [
            {
              Email: email,
            },
          ],
          Subject: subject,
          HTMLPart: html,
        },
      ],
    });
  };
}
