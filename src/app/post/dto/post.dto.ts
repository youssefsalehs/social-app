export interface CreatePostDto {
  content: string;
  allowsComments?: boolean;
}

export interface UpdatePostDto {
  content?: string;
  allowsComments?: boolean;
}

export interface PaginateDto {
  page: number;
  limit: number;
}

export interface PaginatedPosts<T> {
  posts: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
