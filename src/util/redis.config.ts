import { RedisOptions } from "ioredis";
import dotenv from "dotenv";
dotenv.config();

export const redisConf: RedisOptions = {
  host: process.env.REDIS_HOST!,
  port: +process.env.REDIS_PORT!,
  password: process.env.REDIS_PASS!,
};
