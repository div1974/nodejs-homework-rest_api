const passport = require('passport')
const passportJWT = require('passport-jwt')
const dotenv = require('dotenv')
dotenv.config()

const { User } = require('../services/schemas')

const { SECRET_KEY } = process.env

const { ExtractJwt } = passportJWT
const { Strategy } = passportJWT

const params = {
  secretOrKey: SECRET_KEY,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()

}

passport.use(
  new Strategy(params, async (payload, done) => {
    try {
      const user = await User.findOne({ _id: payload.id })

      done(null, user)
    } catch (error) {
      done(error)
    }
  })
)
