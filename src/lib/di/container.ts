import { container } from "tsyringe";
import { UserService } from "../../app/user/service/user.service";
import { UserController } from "../../app/user/controller/user.controller";
import { UserRepository } from "../../app/user/repository/user.repo";
import { TOKENS } from "./tokens";
import { PostService } from "../../app/post/service/post.service";
import { PostController } from "../../app/post/controller/post.controller";
import { PostRepository } from "../../app/post/repository/post.repository";
import { AuthService } from "../../app/auth/service/auth.service";
import { AuthController } from "../../app/auth/controller/auth.controller";
import { cacheProvider } from "../cache/init";
import { s3CloudProvider } from "../cloud/init";
import { mailjetProvider, nodemailerProvider } from "../email/init";

//services
container.registerSingleton<AuthService>(TOKENS.AuthService, AuthService);
container.registerSingleton<UserService>(TOKENS.UserService, UserService);
container.registerSingleton<PostService>(TOKENS.PostService, PostService);

//controllers
container.registerSingleton<AuthController>(
  TOKENS.AuthController,
  AuthController,
);
container.registerSingleton<UserController>(
  TOKENS.UserController,
  UserController,
);
container.registerSingleton<PostController>(
  TOKENS.PostController,
  PostController,
);

//repository
container.registerSingleton<UserRepository>(
  TOKENS.UserRepository,
  UserRepository,
);
container.registerSingleton<PostRepository>(
  TOKENS.PostRepository,
  PostRepository,
);

//utils
container.registerInstance(TOKENS.CacheProvider, cacheProvider);
container.registerInstance(TOKENS.S3CloudProvider, s3CloudProvider);
container.registerInstance(TOKENS.NodemailerProvider, nodemailerProvider);
container.registerInstance(TOKENS.MailjetProvider, mailjetProvider);
export default container;
