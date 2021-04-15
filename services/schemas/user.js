const { Schema, model } = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    subscription: {
      type: String,
      enum: ['starter', 'pro', 'business'],
      default: 'starter'
    },
    token: {
      type: String,
      default: null,
    },
  },
  { versionKey: false }
)

userSchema.methods.setPassword = async function(password) {
  this.password = await bcrypt.hashSync(password, bcrypt.genSaltSync())
}

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password)
}
const User = model('User', userSchema)

module.exports = User
