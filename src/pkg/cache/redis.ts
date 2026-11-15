import Redis from "ioredis";
import { ICacheProvider } from "./cache.interface";
interface IRedisConfig {
  url: string;
}
export default class RedisCacheProvider implements ICacheProvider {
  private client: Redis;
  constructor(config: IRedisConfig) {
    this.client = new Redis(config.url);
    this.client
      .connect()
      .catch((err: Error) => console.log("connection failed", err.message));
    this.client.on("error", (err: Error) => {
      console.log("Redis error", err);
    });
  }
  async set(key: string, value: string, ttl: number) {
    return this.client.set(key, value, "EX", ttl);
  }
  async get(key: string) {
    return this.client.get(key);
  }
  async del(key: string) {
    return this.client.del(key);
  }
  async ttl(key: string) {
    return this.client.ttl(key);
  }
}
