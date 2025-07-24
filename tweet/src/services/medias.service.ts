import { Request } from "express"
import { getNameFromFullname, handleUploadImage, handleUploadVideo } from "../utils/files"
import sharp from "sharp"
import { UPLOAD_IMAGE_DIR } from "../constants/dir"
import path from "path"
import fs from 'fs'
import { isProduction } from "../constants/config"
import { config } from "dotenv"
import { MediaType } from "../constants/enum"
import { Media } from "../model/other"
config()
class MediasService {
  async UploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(files.map(async file => {
      const newName = getNameFromFullname(file.newFilename)
      const newFullFilename = `${newName}.jpg`
      const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFilename)
      await sharp(file.filepath).jpeg().toFile(newPath)
      fs.unlinkSync(file.filepath) // delete image in temp
      return {
        url: isProduction ? `${process.env.HOST}/static/${newFullFilename}` : `http://localhost:${process.env.PORT}/static/${newFullFilename}`,
        type: MediaType.Image
      }
    }))
    return result

  }
  async UploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = files.map((file) => {
      return {
        url: isProduction ? `${process.env.HOST}/static/video/${file.newFilename}` : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        type: MediaType.Video
      }
    })
    
    return result

  }
}
const mediasService = new MediasService()
export default mediasService