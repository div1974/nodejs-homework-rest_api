const passport = require('passport')
require('../configs/config-passport')

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

module.exports = {
  auth
}
