const express = require('express')
const app = express()
const controllers = require('./controllers')
app.get('/authors' , controllers.get_all_authors)
app.post('/search' , controllers.get_author)
app.post('/wrote' , controllers.books_wrote)
app.post('/add' , controllers.add_author)
app.patch('/update' , controllers.update_author_username)
module.exports = {
    app
}