import { Router } from "express"
import { accessTokenValidator, verifiedUserValidator } from "../middleware/users.middlewares";
import { wrapRequestHandler } from "../utils/handler";
import { bookmarkTweetController, unbookmarkTweetController } from "../controllers/bookmark.controller";
import { tweetIdValidator } from "../middleware/tweet.middlewares";

const bookmarksRouter = Router()
/**
 * Description: Bookmark Tweet
 * Path: /
 * Method: POST
 * Body: { tweet_id: string }
 * Header: { Authorization: Bearer <access_token> }
 */
bookmarksRouter.post(
  '',
  accessTokenValidator,
  verifiedUserValidator,
  // tweetIdValidator,
  wrapRequestHandler(bookmarkTweetController)
)

/**
 * Description: Unbookmark Tweet
 * Path: /tweets/:tweet_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 */
bookmarksRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unbookmarkTweetController)
)

export default bookmarksRouter