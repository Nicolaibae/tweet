import { Request } from "express"
import fs from "fs"
import path from "path"
import { formidable, File } from "formidable"
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from "../constants/dir"


export const initFolder = () => {
  [UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true // mục đích tạo folder cha
      })
    }
  })

}
export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 300 * 1024 * 1024, // 300kb
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('file type is not valid') as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      if (!Boolean(files.image)) {
        return reject(new Error('File is not empty'))
      }
      resolve(files.image as File[])
    });
  })


}
export const handleUploadVideo = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 4,
    maxFileSize: 50 * 1024 * 1024, // 50Mb
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name ==='video' && Boolean(mimetype?.includes('mp4'))|| mimetype?.includes('qicktime')
      if(!valid){
        form.emit('error' as any, new Error('file type is not valid') as any)
      }
      return true
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      if (!Boolean(files.video)) {
        return reject(new Error('File is not empty'))
      }
      const videos = files.video as File[]
      videos.forEach((video)=>{
        const ext = getExtension(video.originalFilename as string)
        fs.renameSync(video.filepath,video.filepath+'.'+ext)
        video.newFilename = video.newFilename+'.'+ext
      })
      resolve(files.video as File[])
    });
  })


}
export const getNameFromFullname = (fullname: string) => {
  const namearr = fullname.split('.')
  namearr.pop()
  return namearr.join('')
}
export const getExtension = (fullname:string)=>{
  const namearr = fullname.split('.')
  return namearr[namearr.length - 1]
}