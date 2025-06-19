import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hassPassword= (password:string):Promise<string>=>{
  return bcrypt.hash(password,SALT_ROUNDS)

}
export const comparePassword = (password:string,hashedPassword:string):Promise<Boolean>=>{
  return bcrypt.compare(password,hashedPassword)

}