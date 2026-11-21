export const TOKENS = {
  AuthService: Symbol("AuthService"),
  UserService: Symbol("UserService"),
  PostService: Symbol("PostService"),

  AuthController: Symbol("AuthController"),
  UserController: Symbol("UserController"),
  PostController: Symbol("PostController"),

  AuthRepository: Symbol("AuthRepository"),
  UserRepository: Symbol("UserRepository"),
  PostRepository: Symbol("PostRepository"),

  S3CloudProvider: Symbol("S3CloudProvider"),
  CacheProvider: Symbol("CacheProvider"),
  NodemailerProvider: Symbol("NodemailerProvider"),
  MailjetProvider: Symbol("MailjetProvider"),
  FirebaseProvider: Symbol("FirebaseProvider"),
};
