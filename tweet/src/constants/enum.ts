export enum UserVerifyStatus {
  Unverified, 
  Verified, // đã xác thực email
  Banned // bị khóa
}
export enum TokenType{
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}