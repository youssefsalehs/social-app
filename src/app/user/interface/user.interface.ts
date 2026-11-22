import { Gender, Provider } from "../../auth/enum/enum";

export interface IUser {
  username: string;
  email: string;
  provider: Provider;
  password?: string;
  isDeleted: boolean;
  isVerified: boolean;
  dob?: Date;
  gender?: Gender;
  profilePicture?: string;
  twoStepVerification: boolean;
  coverPicture?: string;
  phoneNumber?: string;
  bio: string;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
}
