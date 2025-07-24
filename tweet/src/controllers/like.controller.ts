import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { Tokenpayload } from "../model/request/user.request";
import { LIKE_MESSAGES } from '../constants/message';
import likeService from '../services/likes.service';
import { LikeTweetReqBody } from '../model/request/like.requests';

export const likeTweetController = async (req: Request<ParamsDictionary, any, LikeTweetReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  const result = await likeService.likeTweet(user_id, req.body.tweet_id)
  return res.json({
    message: LIKE_MESSAGES.LIKE_SUCCESSFULLY,
    result
  })
}

export const unlikeTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as Tokenpayload
  await likeService.unlikeTweet(user_id, req.params.tweet_id)
  return res.json({
    message: LIKE_MESSAGES.UNLIKE_SUCCESSFULLY
  })
}