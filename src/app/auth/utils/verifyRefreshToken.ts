import jwt from "jsonwebtoken";
import { env } from "../../../lib/config/env";
import { IUserPayload } from "../../../lib/interface/userPayload.interface";
export default function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.jwt.refreshSecret) as IUserPayload;
}
