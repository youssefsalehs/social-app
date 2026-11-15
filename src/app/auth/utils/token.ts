import { env } from "../../../lib/config/env";
import { toMs } from "../../../pkg/utils/time";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUser } from "../../user/interface/user.interface";
import { IUserPayload } from "../../../lib/interface/userPayload.interface";
export const generateAccessToken = (payload: IUserPayload) =>
  jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: toMs(1, "hours"),
  });

export const generateRefreshToken = (payload: IUserPayload) =>
  jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: toMs(7, "days"),
  });
