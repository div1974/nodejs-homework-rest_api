const { User } = require('./schemas')

const getUser = (email) => {
  return User.findOne(email)
}

const updateUser = (id, userToken) => {
  return User.updateOne({ _id: id }, { token: userToken})
}

const addUser = ({ email, password, subscription }) => {
//   const codedPsw = User.setPassword(password)
//   const result = User.create({ email, codedPsw, subscription })  
//   return result

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
