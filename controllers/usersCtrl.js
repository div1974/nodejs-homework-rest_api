const { usersService } = require('../services')
const Joi = require('joi')

const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const path = require('path')

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

    const result = await usersService.addUser({ email, password, subscription })
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

    if (!user || !user.validPassword(password)) {
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

module.exports = {
  regUser,
  loginUser,
  getUser,
  logoutUser,
  avatars
}
