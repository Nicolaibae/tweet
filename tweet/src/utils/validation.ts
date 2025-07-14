import express from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema';
import { EntityError, ErrorWithStatus } from '../model/errors';
import httpStatus from '../constants/httpStatus';



export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
     await validation.run(req)
     const errors = validationResult(req)
     // không có lỗi thì next
      if (errors.isEmpty()) {
        return next();
      }
     const errorObj = errors.mapped()
     const entityError = new EntityError({errors:{}})
     for(const key in errorObj){
      const {msg} = errorObj[key]
      if(msg instanceof ErrorWithStatus && msg.status!==httpStatus.unprocessable_entity){//
        return next(msg)
      }
      entityError.errors[key] = errorObj[key]
    
     }
     
      next(entityError)
    }
// khác lỗi 422 sẽ xử lí như bthg còn là 422 sẽ trả lỗi ra như dòng 25
    
  };
