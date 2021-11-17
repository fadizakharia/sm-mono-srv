import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { errorController } from "./controller/ErrorController";
import routes from "./routes/routes";
import mongoose from "mongoose";
import session from "express-session";
import { json } from "body-parser";
import Redis from "ioredis";
import connectRedis from "connect-redis";
import cors from "cors";
import { redisConf } from "./util/redis.config";
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

async function startApp() {
  dotenv.config();
  const app = express();
  const redisStore = connectRedis(session);
  const redisInstance = new Redis(redisConf);
  const port = process.env.PORT ? process.env.PORT : 3001;
  app.use(json());
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.ORIGIN
          : "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(
    session({
      store: new redisStore({ client: redisInstance }),
      secret: process.env.SESSION_SECRET!,
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 3,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
      rolling: true,
      saveUninitialized: true,
    })
  );

  app.use("/post", routes.postRoutes);
  app.use("/user", routes.userRoutes);
  app.all("*", (_: Request, res: Response, __: NextFunction) => {
    return res.status(404).send({ error: "Page not found!" });
  });
  app.use(errorController);
  app
    .listen(port, async () => {
      console.log("server listening on port: " + port);
      console.log(process.env.MONGO_URL);

      await mongoose.connect(process.env.MONGO_URL!);
    })
    .addListener("error", (err) => {
      if (err) {
        console.log(err);
      }
    });
}
startApp();
