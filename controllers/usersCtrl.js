const { usersService } = require('../services')
const Joi = require('joi')

const passport = require('passport')

const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()
require('../configs/config-passport')

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
    console.log('user token before', user.token)

    user.token = userToken
    await usersService.updateUser(user.id, userToken)
    console.log('user token after', user.token)
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

const auth = async (req, res, next) => {
  await passport.authenticate('jwt', { session: false }, (err, user) => {
    if (!user || err) {
      return res.status(401).json({
        status: '401 Unauthorized',
        message: 'You are not authorized'
      })
    }
    req.user = user

    next()
  })(req, res, next)
}

const logoutUser = async (req, res, next) => {
  const userIn = req.user
  try {
    console.log(userIn.email)
    userIn.token = null
    await usersService.updateUser(userIn.id, null)

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

module.exports = {
  regUser,
  loginUser,
  auth,
  getUser,
  logoutUser
}
