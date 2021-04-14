const express = require('express')
const routerContacts = express.Router()

const { ctrlContact} = require('../../controllers')

routerContacts.get('/', ctrlContact.get)

routerContacts.get('/:contactId', ctrlContact.getById)

routerContacts.post('/', express.json(), ctrlContact.add)

routerContacts.delete('/:contactId', ctrlContact.remove)

routerContacts.patch('/:contactId', express.json(), ctrlContact.update)

routerContacts.patch('/:contactId/favorite', express.json(), ctrlContact.updateById)

module.exports = routerContacts
