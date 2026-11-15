import bcrypt from "bcrypt";
export const hashPassword = async (password:string) => bcrypt.hash(password, 12);
export const matchPassword = async (password:string, hashedPassword:string) =>
  bcrypt.compare(password, hashedPassword);
