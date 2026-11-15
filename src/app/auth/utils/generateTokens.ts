import { Response } from "express";
import { toMs } from "../../../pkg/utils/time";

export default function generateTokens(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    maxAge: toMs(1, "hours"),
  });
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    path: "/api/v1/auth/",
    maxAge: toMs(7, "days"),
  });
}
