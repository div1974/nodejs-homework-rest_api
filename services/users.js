const { User } = require('./schemas')

const getUser = (field) => {
  return User.findOne(field)
}

const updateUser = (id, updateKey, updateValue) => {
  return User.updateOne({ _id: id }, { [updateKey]: updateValue })
}

const addUser = ({ email, password, subscription, verifyToken }) => {
  const newUser = new User({ email, password, subscription, verifyToken })
  newUser.setPassword(password)
  const result = newUser.save()
  return result
}

const verify = async (token) => {
  const user = await User.findOne(token)

  if (user) {
    await user.updateOne({ verify: true, verifyToken: null })
    return true
  }
  return false
}

module.exports = {
  getUser,
  addUser,
  updateUser,
  verify
}
