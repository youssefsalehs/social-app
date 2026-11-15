import jwt from "jsonwebtoken";
import * as userErrors from "../../app/user/errors";
import { env } from "../config/env";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../../pkg/error/error";
import User from "../../app/user/model/user.model";
import { IUserPayload } from "../interface/userPayload.interface";
interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}
export const guard = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return next(new AppError("Authentication token missing.", 401));
    }
    const decoded = jwt.verify(token, env.jwt.accessSecret) as IUserPayload;
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(userErrors.userNotFound);
    }
    req.user = decoded;

    next();
  } catch (error) {
    return next(new AppError("Invalid or expired token.", 401));
  }
};
