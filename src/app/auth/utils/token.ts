import jwt from "jsonwebtoken";
import { env } from "../../../lib/config/env";
import { IUserPayload } from "../../../lib/interface/userPayload.interface";
import { toMs } from "../../../pkg/utils/time";
export const generateAccessToken = (payload: IUserPayload) =>
  jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: toMs(1, "hours"),
  });

export const generateRefreshToken = (payload: IUserPayload) =>
  jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: toMs(7, "days"),
  });
