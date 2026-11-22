import { Types } from "mongoose";

export interface FollowDto {
  follower: string;
  following: string;
}
export interface UnFollowDto {
  follower: string;
  following: string;
}
export interface RespondFollow {
  following: string;
  follower: string;
  action: "accept" | "reject";
}
