import { JwtPayload } from "jsonwebtoken";
import { TokenType } from "../../constants/enum";

export interface registerBody{
  name:string,
  email:string,
  password:string,
  confirm_password:string,
  date_of_birth:string

}
export interface logoutReqBody{
  refresh_token:string
}
export interface Tokenpayload extends JwtPayload{
  user_id:string,
  token_type: TokenType
}