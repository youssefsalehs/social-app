import { ICloudProvider } from "./cloud.interface";
import fs from "node:fs";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
interface S3Config {
  region: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
}
export class S3CloudProvider implements ICloudProvider {
  private client: S3Client;
  private readonly bucketName: string;
  constructor(config: S3Config) {
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
    });
    this.bucketName = config.bucketName;
  }
  async uploadFile(file: Express.Multer.File, path: string): Promise<string> {
    const fileBuffer = fs.readFileSync(file.path);
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Body: fileBuffer,
      ContentType: file.mimetype,
      Key: `${path}/${crypto.randomUUID()}-${file.originalname}`,
    });
    await this.client.send(command);
    return command.input.Key as string;
  }
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    await this.client.send(command);
  }
  async getFile(key: string): Promise<Buffer> {
    // const command = new GetObjectCommand({
    //   Bucket: this.bucketName,
    //   Key: key,
    // });
    // await this.client.send(command);
    return Promise.resolve(new Buffer("oo"));
  }
}
