import { Gender } from "../enum/enum";

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  dob: Date;
  gender?: Gender;
  phoneNumber?: string;
}
export interface LoginDto {
  email: string;
  password: string;
}
export interface VerifyAccountDto {
  email: string;
  code: string;
}
export interface VerifyLoginDto {
  email: string;
  code: string;
}
export interface SendOtpDto {
  email: string;
}

export interface Enable2faDto {
  email: string;
}

export interface Verify2faDto {
  email: string;
  code: string;
}
export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}
