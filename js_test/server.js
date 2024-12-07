const fsPromises = require('fs').promises
const fs = require('fs')
const emitter = require('events')
const path = require('path')
const http = require('http')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const app = express()
const users_routes = require('./users/routes')
const books_routes = require('./books/routes')
const author_routes = require('./authors/routes')
const authenticateJWT = require('./users/generateTokens').authenticateJWT
const runserver = http.createServer(app)
const PORT = process.env.PORT || 8000
//middleware
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'static')))
app.use(cors());
//page routes
app.get('/' , (req , res) => {
    res.sendFile(path.join(__dirname , 'views' , 'login' , 'login.html'))
})
app.get('/register' , (req , res) => {
    res.sendFile(path.join(__dirname , 'views' , 'login' , 'register.html'))
})
app.get('/homepage' , (req , res) => {
    res.sendFile(path.join(__dirname , 'views' , 'login' , 'homePage.html'))
})
//api routes
app.use('/api' , users_routes.app)
// app.use(authenticateJWT)
app.use('/api/books' , books_routes.app)
app.use('/api/authors' , author_routes.app)

runserver.listen(PORT , ()=> {console.log(`server is running on port ${PORT}`)})