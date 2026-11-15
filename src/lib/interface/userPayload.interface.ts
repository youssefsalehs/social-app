import { IUser } from "../../app/user/interface/user.interface";
import { JwtPayload } from "jsonwebtoken";

export interface IUserPayload extends JwtPayload, Partial<IUser> {}
