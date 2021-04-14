const express = require('express')
const routerUsers = express.Router()

const { ctrlUser } = require('../../controllers')

routerUsers.post('/signup', express.json(), ctrlUser.regUser)
routerUsers.post('/login', express.json(), ctrlUser.loginUser)
routerUsers.post('/logout', ctrlUser.auth, ctrlUser.logoutUser)
routerUsers.get('/current', ctrlUser.auth, ctrlUser.getUser)

module.exports = routerUsers
