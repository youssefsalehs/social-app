export interface CreateCommentDto {
  postId: string;
  content: string;
  parentId?: string;
}

export interface UpdateCommentDto {
  content?: string;
}

export interface PaginateDto {
  page: number;
  limit: number;
}

export interface PaginatedComments<T> {
  comments: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
