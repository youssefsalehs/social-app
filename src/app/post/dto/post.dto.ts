export interface CreatePostDto {
  content: string;
  allowsComments?: boolean;
}

export interface UpdatePostDto {
  content?: string;
  allowsComments?: boolean;
}

export interface GetPostsQuery {
  page?: string;
  limit?: string;
}
