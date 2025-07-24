import { NextFunction, Request, Response, Router } from "express"
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from "../middleware/users.middlewares"
import { createTweetController, getNewFeedsController, getTweetChildrenController, getTweetController } from "../controllers/tweet.controller"
import { wrapRequestHandler } from "../utils/handler"
import { audienceValidator, createTweetValidator, getTweetChildrenValidator, paginationValidator, tweetIdValidator } from "../middleware/tweet.middlewares"

const tweetsRouter = Router()
/** create tweet
 * method: POST
 * body: tweetreqbody
 */

tweetsRouter.post("/", accessTokenValidator,verifiedUserValidator,createTweetValidator, wrapRequestHandler(createTweetController))
/**
 * Description: Get Tweet detail
 * Path: /:tweet_id
 * Method: GET
 * Header: { Authorization?: Bearer <access_token> }
 */
tweetsRouter.get("/:tweet_id", tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetController)
)
/**
 * Description: Get Tweet Children
 * Path: /:tweet_id/children
 * Method: GET
 * Header: { Authorization?: Bearer <access_token> }
 * Query: { limit: number, page: number, tweet_type: TweetType }
 */
tweetsRouter.get(
  '/:tweet_id/children',
  tweetIdValidator,
  paginationValidator,
  getTweetChildrenValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetChildrenController)
)

/**
 * Description: Get new feeds
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Query: { limit: number, page: number }
 */
tweetsRouter.get(
  '/',
  paginationValidator,
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getNewFeedsController)
)
export default tweetsRouter


