import { Router } from 'express'
import { accessTokenValidator, verifiedUserValidator } from '../middleware/users.middlewares'
import { tweetIdValidator } from '../middleware/tweet.middlewares'
import { wrapRequestHandler } from '../utils/handler'
import { likeTweetController, unlikeTweetController } from '../controllers/like.controller'


const likesRouter = Router()
/**
 * Description: Like Tweet
 * Path: /
 * Method: POST
 * Body: { tweet_id: string }
 * Header: { Authorization: Bearer <access_token> }
 */
likesRouter.post(
  '',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(likeTweetController)
)

/**
 * Description: Unlike Tweet
 * Path: /tweets/:tweet_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 */
likesRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unlikeTweetController)
)

export default likesRouter