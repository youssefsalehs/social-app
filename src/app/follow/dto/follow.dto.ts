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

export interface PaginateDto {
  page: number;
  limit: number;
}

export interface PaginatedRequests<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
