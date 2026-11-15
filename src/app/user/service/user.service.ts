// import * as authRepo from "../../auth/repository/auth.repo.js";
// import * as userRepo from "../repository/user.repo.js";
// import { userNotFound } from "../errors.js";
// import { passwordNotMatch, samePassword } from "../../auth/errors.js";
// import { hashPassword, matchPassword } from "../../auth/utils/hash.js";
// import fs from "fs";
// import { AppError } from "../../../pkg/error/error.js";

// export async function getMe(email) {
//   const user = await authRepo.checkUserByEmail(email);
//   user.password = undefined;
//   return user;
// }
// export async function getAllUsers() {
//   const users = await userRepo.getAllUsers();
//   return users;
// }
// export async function updateMe(email, data) {
//   const user = await authRepo.checkUserByEmail(email);

//   const updates = Object.assign(user, data);
//   const updatedUser = await userRepo.updateUserByEmail(email, updates);
//   updatedUser.password = undefined;
//   return updatedUser;
// }
// export async function deleteAccount(email) {
//   const user = await authRepo.checkUserByEmail(email);
//   if (user.isDeleted) {
//     throw userNotFound;
//   }
//   await userRepo.updateUserByEmail(email, { isDeleted: true });
// }
// export async function updatePassword(email, data) {
//   const user = await authRepo.checkUserByEmail(email);
//   const isMatch = await matchPassword(data.password, user.password);
//   if (!isMatch) throw passwordNotMatch;
//   const isSamePassword = await matchPassword(data.newPassword, user.password);
//   if (isSamePassword) {
//     throw samePassword;
//   }
//   const hashedPassword = await hashPassword(data.newPassword);
//   await userRepo.updateUserByEmail(email, { password: hashedPassword });
// }
// export async function uploadProfilePicture(req, userId, filePath) {
//   const user = await userRepo.findUserById(userId);
//   if (!user) {
//     throw userNotFound;
//   }
//   if (user.profilePicture) {
//     fs.unlinkSync(user.profilePicture);
//   }

//   await userRepo.updateUserByEmail(user.email, {
//     profilePicture: filePath,
//   });
// }
// export async function uploadCoverPicture(req, userId, filePath) {
//   const user = await userRepo.findUserById(userId);
//   if (!user) {
//     throw userNotFound;
//   }
//   if (user.coverPicture) {
//     fs.unlinkSync(user.coverPicture);
//   }
//   await userRepo.updateUserByEmail(user.email, { coverPicture: filePath });
// }

// export async function getUserByUsername(username) {
//   if (!username) {
//     throw new AppError("Username is required", 400);
//   }
//   const user = await userRepo.findUserByUsername(username);
//   if (!user) {
//     throw userNotFound;
//   }
//   return user;
// }
