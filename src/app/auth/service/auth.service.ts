import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { getOtpEmailTemplate } from "../../../lib/email/emailTemplates";
import { generateOtp } from "../../../lib/utils/generateOtp";
import { verifyGoogleToken } from "../../../lib/utils/google-auth";
import { ICacheProvider } from "../../../pkg/cache/cache.interface";
import { MailProvider } from "../../../pkg/email/mail.interface";
import { AppError } from "../../../pkg/error/error";
import { toSeconds } from "../../../pkg/utils/time";
import * as userErrors from "../../user/errors";
import { UserRepository } from "../../user/repository/user.repo";
import {
  Enable2faDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  SendOtpDto,
  Verify2faDto,
  VerifyAccountDto,
  VerifyLoginDto,
} from "../dto";
import { Provider } from "../enum/enum";
import * as authErrors from "../errors";
import { hashPassword, matchPassword } from "../utils/hash";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import verifyRefreshToken from "../utils/verifyRefreshToken";
@injectable()
export class AuthService {
  private readonly enable2FAKey: string = `enable2FactorAuth`;
  private readonly login2FAKey: string = `loginCode`;
  private readonly sendOtpKey: string = "otp";

  constructor(
    @inject(TOKENS.UserRepository)
    private readonly userRepository: UserRepository,
    @inject(TOKENS.NodemailerProvider)
    private readonly mailProvider: MailProvider,
    @inject(TOKENS.CacheProvider)
    private readonly cacheProvider: ICacheProvider,
  ) {}

  register = async (registerDto: RegisterDto) => {
    const user = await this.userRepository.findByEmail(registerDto.email);
    if (user) {
      throw userErrors.userAlreadyExists;
    }
    registerDto.password = await hashPassword(registerDto.password);
    const newUser = await this.userRepository.create(registerDto);
    if (!newUser) {
      throw userErrors.userCreationFailed;
    }
    const code = generateOtp();

    await this.cacheProvider.set(
      `${this.sendOtpKey}:${newUser?._id.toString()}`,
      code,
      toSeconds(15, "minutes"),
    );
    newUser.password = "";
    const htmlContent = getOtpEmailTemplate(code, "register");

    await this.mailProvider.send(
      newUser.email,
      "Verify Your Email - Glimpse",
      htmlContent,
    );
    return newUser;
  };

  verifyAccount = async (verifyAccountDto: VerifyAccountDto) => {
    const user = await this.userRepository.findByEmail(verifyAccountDto.email);
    if (!user) {
      throw userErrors.userNotFound;
    }
    if (user.isVerified === true) {
      throw userErrors.userAlreadyVerified;
    }

    const otp = await this.cacheProvider.get(
      `${this.sendOtpKey}:${user._id.toString()}`,
    );
    if (!otp) {
      throw authErrors.otpExpired;
    }
    if (verifyAccountDto.code !== otp) {
      throw authErrors.wrongOtp;
    }

    const updatedUser = await this.userRepository.update(
      { email: verifyAccountDto.email },
      {
        isVerified: true,
      },
    );
    await this.cacheProvider.del(`${this.sendOtpKey}:${user._id.toString()}`);

    return updatedUser;
  };

  login = async (loginDto: LoginDto) => {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw userErrors.userNotFound;
    }
    if (user.isVerified === false) {
      throw userErrors.userNotVerified;
    }

    const isMatch = await matchPassword(
      loginDto.password,
      user?.password as string,
    );

    if (!isMatch) {
      throw authErrors.passwordNotMatch;
    }
    user.password = "";
    if (user.twoStepVerification) {
      const code = generateOtp();
      await this.cacheProvider.set(
        `${this.login2FAKey}:${loginDto.email}`,
        code,
        toSeconds(3, "minutes"),
      );
      const htmlContent = getOtpEmailTemplate(code, "login2FA");
      this.mailProvider.send(
        loginDto.email,
        "Login with two step verification",
        htmlContent,
      );
      return { user };
    }
    if (user.isDeleted) {
      await this.userRepository.update(
        { email: loginDto.email },
        { isDeleted: false },
      );
    }
    const accessToken = generateAccessToken({
      id: user._id,
      email: user.email,
      username: user.username,
    });
    const refreshToken = generateRefreshToken({
      id: user._id,
    });

    await this.cacheProvider.set(
      `refreshToken:${user._id.toString()}`,
      refreshToken,
      toSeconds(7, "days"),
    );

    return { user, tokens: { accessToken, refreshToken } };
  };
  sendOtp = async (sendOtpDto: SendOtpDto) => {
    const user = await this.userRepository.findByEmail(sendOtpDto.email);

    if (!user) {
      throw userErrors.userNotFound;
    }

    const code = generateOtp();
    await this.cacheProvider.set(
      `${this.sendOtpKey}:${user._id.toString()}`,
      code,
      toSeconds(15, "minutes"),
    );

    const htmlContent = getOtpEmailTemplate(code, "resend");

    await this.mailProvider.send(user.email, "New OTP - NGL", htmlContent);
  };

  verifyLoginCode = async (verifyLoginDto: VerifyLoginDto) => {
    const user = await this.userRepository.findByEmail(verifyLoginDto.email);
    if (!user) {
      throw userErrors.userNotFound;
    }
    if (!user.isVerified) {
      throw userErrors.userNotVerified;
    }
    const cachedCode = await this.cacheProvider.get(
      `${this.login2FAKey}:${verifyLoginDto.email}`,
    );
    if (!cachedCode) {
      throw authErrors.otpExpired;
    }
    if (+verifyLoginDto.code != +cachedCode) {
      throw authErrors.wrongOtp;
    }
    if (user.isDeleted) {
      await this.userRepository.update(
        { email: verifyLoginDto.email },
        {
          isDeleted: false,
        },
      );
    }
    const accessToken = generateAccessToken({
      id: user._id,
      email: user.email,
      username: user.username,
    });
    const refreshToken = generateRefreshToken({
      id: user._id,
    });
    await this.cacheProvider.set(
      `refreshToken:${user._id.toString()}`,
      refreshToken,
      toSeconds(7, "days"),
    );

    await this.cacheProvider.del(`${this.login2FAKey}:${verifyLoginDto.email}`);

    return { user, tokens: { accessToken, refreshToken } };
  };

  resetPassword = async (resetPasswordDto: ResetPasswordDto) => {
    const user = await this.userRepository.findByEmail(resetPasswordDto.email);
    if (!user) {
      throw userErrors.userNotFound;
    }
    if (user.isVerified === false) {
      throw userErrors.userNotVerified;
    }

    const otp = await this.cacheProvider.get(
      `${this.sendOtpKey}:${user._id.toString()}`,
    );
    if (!otp) {
      throw authErrors.otpExpired;
    }
    if (+otp !== +resetPasswordDto.code) {
      throw authErrors.wrongOtp;
    }
    const hashedPassword = await hashPassword(resetPasswordDto.newPassword);
    await this.userRepository.update(
      { email: resetPasswordDto.email },
      { password: hashedPassword },
    );
    await this.cacheProvider.del(`${this.sendOtpKey}:${user._id.toString()}`);
  };

  loginWithGoogle = async (idToken: string) => {
    const payload = await verifyGoogleToken(idToken);
    if (!payload) throw new AppError("no payload provided", 400);
    const user = await this.userRepository.findByEmail(
      payload?.email as string,
    );
    const accessToken = generateAccessToken({
      id: user?._id,
      email: user?.email,
      username: user?.username,
    });
    const refreshToken = generateRefreshToken({
      id: user?._id,
    });
    await this.cacheProvider.set(
      `refreshToken:${user?._id.toString()}`,
      refreshToken,
      toSeconds(7, "days"),
    );
    if (user) {
      if (user.isDeleted) {
        await this.userRepository.update(
          { email: user.email },
          { isDeleted: false },
        );
      }
      return { accessToken, refreshToken };
    }
    await this.userRepository.create({
      username: payload.name,
      email: payload.email,
      provider: Provider.GOOGLE,
      isVerified: true,
    });
    return { accessToken, refreshToken };
  };
  refresh = async (token: string) => {
    if (!token) {
      throw authErrors.refreshExpired;
    }

    const payload = verifyRefreshToken(token);

    const user = await this.userRepository.getOne({ _id: payload.id });
    if (!user?.isVerified) {
      throw userErrors.userNotVerified;
    }
    if (!user || user.isDeleted) {
      throw userErrors.userNotFound;
    }
    const storedToken = await this.cacheProvider.get(
      `refreshToken:${payload.id}`,
    );

    if (!storedToken) {
      throw authErrors.refreshExpired;
    }

    const accessToken = generateAccessToken({
      id: user._id,
      email: user.email,
      username: user.username,
    });
    const refreshToken = generateRefreshToken({
      id: user._id,
    });
    await this.cacheProvider.set(
      `refreshToken:${user._id.toString()}`,
      refreshToken,
      toSeconds(7, "days"),
    );

    return { accessToken, refreshToken };
  };
  enable2StepVerification = async (enable2faDto: Enable2faDto) => {
    const user = await this.userRepository.findByEmail(enable2faDto.email);
    if (!user || user.isDeleted) {
      throw userErrors.userNotFound;
    }
    if (!user.isVerified) {
      throw userErrors.userNotVerified;
    }
    if (user.twoStepVerification) {
      throw authErrors.twoFactorAuthEnabled;
    }
    const code = generateOtp();

    await this.cacheProvider.set(
      `${this.enable2FAKey}:${enable2faDto.email}`,
      code,
      toSeconds(3, "minutes"),
    );
    const htmlContent = getOtpEmailTemplate(code, "enable2FA");
    await this.mailProvider.send(
      enable2faDto.email,
      "Enable two step verification",
      htmlContent,
    );
  };
  verifyEnable2StepVerification = async (verify2faDto: Verify2faDto) => {
    const user = await this.userRepository.findByEmail(verify2faDto.email);
    if (!user?.isVerified) {
      throw userErrors.userNotVerified;
    }
    if (!user || user.isDeleted) {
      throw userErrors.userNotFound;
    }

    const cachedCode = await this.cacheProvider.get(
      `${this.enable2FAKey}:${verify2faDto.email}`,
    );
    if (!cachedCode) {
      throw authErrors.otpExpired;
    }
    if (cachedCode != verify2faDto.code) {
      throw authErrors.wrongOtp;
    }

    await this.userRepository.update(
      { email: verify2faDto.email },
      { twoStepVerification: true },
    );
    await this.cacheProvider.del(`${this.enable2FAKey}:${verify2faDto.email}`);
  };
}
