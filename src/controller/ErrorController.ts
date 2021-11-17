import { Request, Response, NextFunction } from "express";
import { HttpError } from "../util/Error";
export const errorController = async (
  error: HttpError,
  _: Request,
  res: Response,
  __: NextFunction
) => {
  const status = error.status || 500;
  const message = error.message || "Something went wrong";
  res.status(status).send({
    status,
    message,
  });
};
