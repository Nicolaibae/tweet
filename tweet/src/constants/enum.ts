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
export enum MediaType{
  Image,
  Video
}
export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}
export enum TweetAudience {
  Everyone, // 0
  TwitterCircle // 1
}