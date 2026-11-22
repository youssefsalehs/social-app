import { IUser } from "../interface/user.interface";

export interface GetProfileDto {
  username: string;
  viewerId: string;
}
export interface UpdateProfileDto {
  userId: string;
  data: Partial<IUser>;
}
export interface ToggleVisibilityDto {
  userId: string;
  data?: {
    isPrivate?: boolean;
  };
}

export interface GetProfilesDto {
  q: string;
  limit: number;
  page: number;
}
