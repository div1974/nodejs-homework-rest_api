const express = require('express')

const routerUsers = express.Router()
const multerHelper = require('../../helpers/multerModule')
const { ctrlUser } = require('../../controllers')
const authModule = require('../../helpers/authModule')

routerUsers.post('/signup', express.json(), ctrlUser.regUser)
routerUsers.post('/login', express.json(), ctrlUser.loginUser)
routerUsers.post('/logout', authModule.auth, ctrlUser.logoutUser)
routerUsers.get('/current', authModule.auth, ctrlUser.getUser)
routerUsers.patch('/avatars', authModule.auth, multerHelper.upload.single('avatar'), ctrlUser.avatars)

module.exports = routerUsers
