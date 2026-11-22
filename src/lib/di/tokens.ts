export const TOKENS = {
  AuthService: Symbol("AuthService"),
  UserService: Symbol("UserService"),
  PostService: Symbol("PostService"),
  CommentService: Symbol("CommentService"),
  FollowService: Symbol("FollowService"),

  AuthController: Symbol("AuthController"),
  UserController: Symbol("UserController"),
  PostController: Symbol("PostController"),
  CommentController: Symbol("CommentController"),
  FollowController: Symbol("FollowController"),

  AuthRepository: Symbol("AuthRepository"),
  UserRepository: Symbol("UserRepository"),
  PostRepository: Symbol("PostRepository"),
  CommentRepository: Symbol("CommentRepository"),
  FollowRepository: Symbol("FollowRepository"),

  S3CloudProvider: Symbol("S3CloudProvider"),
  CacheProvider: Symbol("CacheProvider"),
  NodemailerProvider: Symbol("NodemailerProvider"),
  MailjetProvider: Symbol("MailjetProvider"),
  FirebaseProvider: Symbol("FirebaseProvider"),
};
