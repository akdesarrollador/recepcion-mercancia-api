// middlewares/validate.ts
import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'

const validateMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next()
}

export default validateMiddleware