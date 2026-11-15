import { JwtPayload } from "jsonwebtoken";
import { IUser } from "../../app/user/interface/user.interface";

declare module "express-serve-static-core" {
  interface Request {
    user?: Partial<IUser> & JwtPayload;
  }
}
