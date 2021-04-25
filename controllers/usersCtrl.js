const { usersService } = require('../services')
const Joi = require('joi')
const { v4 } = require('uuid')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const path = require('path')
const emailService = require('../helpers/email')
const fs = require('fs').promises

const imgRefactoring = require('../helpers/imgResize')

dotenv.config()

const regUser = async (req, res, next) => {
  const { email, password, subscription } = req.body
  const userSchema = Joi.object({

    email: Joi.required(),
    password: Joi.required(),
    subscription: Joi.string().default('starter')

  })

  try {
    await userSchema.validateAsync(req.body)

    const user = await usersService.getUser({ email })
    if (user) {
      return res.status(409).json({
        status: '409 Conflict',
        message: 'Email is in use',

      })
    }

    const verifyToken = v4()
    try {
      await emailService.sendEmail(verifyToken, email)
    } catch (err) {
      throw new Error(503, err.message, 'Service unavailable')
    }
    const result = await usersService.addUser({ email, password, subscription, verifyToken })
    res.status(201).json({
      status: 'success',
      code: 201,
      ResponseBody: {
        user: { email: `${result.email}`, subscription: `${result.subscription}` }
      },
    })
  } catch (error) {
    next(error)
  }
}

const loginUser = async (req, res, next) => {
  const { email, password } = req.body
  const userSchema = Joi.object({

    email: Joi.required(),
    password: Joi.required(),

  })

  try {
    await userSchema.validateAsync(req.body)

    const user = await usersService.getUser({ email })

    if (!user || !user.validPassword(password) || !user.verify) {
      return res.status(400).json({
        status: '401 Unauthorized',
        message: 'Incorrect login or password',
      })
    }

    const payload = {
      id: user._id
    }
    const { SECRET_KEY } = process.env

    const userToken = jwt.sign(payload, SECRET_KEY)
    user.token = userToken
    await usersService.updateUser(user.id, 'token', userToken)
    const userSubscription = user.subscription

    res.json({
      status: '200 OK',
      ResponseBody: {
        userToken,
        user: { email, userSubscription }

      }
    })
  } catch (error) {
    next(error)
  }
}

const logoutUser = async (req, res, next) => {
  const userIn = req.user
  try {
    console.log(userIn.email)
    userIn.token = null
    const updateKey = 'token'
    await usersService.updateUser(userIn.id, updateKey, null)

    return res.json({
      status: ' 204 No content'

    })
  } catch (error) {
    next(error)
  }
}

const getUser = async (req, res, next) => {
  try {
    const { email, subscription } = req.user
    res.json({
      status: '200 OK',
      ResponseBody: {
        user: { email, subscription }
      }
    })
  } catch (error) {
    next(error)
  }
}

const avatars = async (req, res, next) => {
  const storageDir = path.join(process.cwd(), 'public/avatars')

  const { path: tempName, filename } = req.file
  const userIn = req.user

  await imgRefactoring.imgResized(tempName)
  const fileName = path.join(storageDir, filename)

  try {
    const PORT = process.env.PORT || 3000
    const { HOST } = process.env

    const avatarUrl = `${HOST}:${PORT}` + '/avatars/' + filename

    await fs.rename(tempName, fileName)
    await usersService.updateUser(userIn.id, 'avatarURL', avatarUrl)
    res.json({
      status: '200 OK',
      ResponseBody: {
        avatarUrl: avatarUrl
      }
    })
  } catch (error) {
    await fs.unlink(tempName)
    return next(error)
  }
}

const verifyToken = async (req, res, next) => {
  try {
    const result = await usersService.verify(req.params)

    if (result) {
      return res.json({
        status: '200 OK',
        ResponseBody: {
          message: 'Verification successful',

        }
      })
    } else {
      return next({
        status: 'BAD_REQUEST',
        ResponseBody: {
          message: 'Your Verification token is not valid. Contact administration'
        }
      })
    }
  } catch (error) {
    next(error)
  }
}

const doubleEmailVerify = async (req, res, next) => {
  const { email } = req.body
  const userSchema = Joi.object({

    email: Joi.required()

  })

  try {
    await userSchema.validateAsync(req.body)

    const user = await usersService.getUser({ email })

    if (!user) {
      return res.status(400).json({
        status: '400 BAD REQUEST',
        message: 'Email not found',

      })
    }

    if (user.verify) {
      return res.status(400).json({
        status: '400 BAD REQUEST',
        message: 'Verification has already been passed',
      })
    }
    const verifyToken = user.verifyToken
    try {
      await emailService.sendEmail(verifyToken, email)
    } catch (err) {
      throw new Error(503, err.message, 'Service unavailable')
    }
    res.json({
      status: '200 OK',
      ResponseBody: {
        message: 'Verification email sent'
      }
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  regUser,
  loginUser,
  getUser,
  logoutUser,
  avatars,
  verifyToken,
  doubleEmailVerify
}
