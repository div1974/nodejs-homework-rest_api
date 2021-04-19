const { User } = require('./schemas')

const getUser = (email) => {
  return User.findOne(email)
}

const updateUser = (id, updateKey, updateValue) => {
  return User.updateOne({ _id: id }, { [updateKey]: updateValue })
}

const addUser = ({ email, password, subscription }) => {
  const newUser = new User({ email, password, subscription })
  newUser.setPassword(password)
  const result = newUser.save()
  return result
}

module.exports = {
  getUser,
  addUser,
  updateUser
}
