export interface CreateCommentDto {
  postId: string;
  content: string;
  parentId?: string;
}

export interface UpdateCommentDto {
  content?: string;
}

export interface GetCommentsQuery {
  page?: string;
  limit?: string;
}
