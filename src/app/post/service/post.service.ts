import { inject, injectable } from "tsyringe";
import { PostRepository } from "../repository/post.repository";
import { TOKENS } from "../../../lib/di/tokens";

@injectable()
export class PostService {
  constructor(
    @inject(TOKENS.PostRepository)
    private readonly postRepository: PostRepository,
  ) {}
}
