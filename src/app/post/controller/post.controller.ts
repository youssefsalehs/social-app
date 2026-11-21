import { inject, injectable } from "tsyringe";
import { PostService } from "../service/post.service";
import { TOKENS } from "../../../lib/di/tokens";

@injectable()
export class PostController {
  constructor(
    @inject(TOKENS.PostService) private readonly postService: PostService,
  ) {}
}
