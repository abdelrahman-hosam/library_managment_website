const express = require('express')
const app = express()
const controllers = require('./controllers')
app.post('/register' , controllers.create_new_user)
app.post('/login' , controllers.login_user)
app.get('/new-token' , controllers.new_access)
app.post('/logout' , controllers.logout)
module.exports = {
    app
}