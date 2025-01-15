const http = require('http')
const mysql2 = require('mysql2')
const database = mysql2.createConnection(
    {

    }
)
const get_all_authors = async (req , res)=>{
    const [authors] = await database.promise().query('SELECT username FROM author')
    const authors_array = authors.map(author => author.username)
    return res.status(200).json({'success message':'Authors are retrieved' , 'authors': authors_array})
}
const get_author = async (req , res) => {
    const id = req.body.id 
    const username = req.body.username
    if(username && id) return res.status(400).json({'error message':'whether search by id or username'})
    if(id){
        const [author] = await database.promise().query('SELECT * FROM author WHERE id = ?' , [id])
        if(!author) return res.status(404).json({'error message':'The author was not found'})
        return res.status(200).json({'success message':'The author was successfully retrieved' , 'author':author})
    }else{
        const [author] = await database.promise().query('SELECT * FROM author WHERE INSTR(username , ?) > 0' , [username])
        if(!author) return res.status(404).json({'error message':'The author was not found'})
        return res.status(200).json({'success message':'The author was successfully retrieved' , 'author':author})
    }
}
const add_author = async (req , res) => {
    const user = req.cookies.username
    const username = req.body.username
    var bio = null
    if(req.body.bio) bio = req.body.bio
    if(await exists(username)) return res.status(400).json({'error message': 'username already exists'})
    const [is_author] = await database.promise().query('SELECT is_author FROM users WHERE username = ?' , [user])
    if(is_author[0]['is_author']) return res.status(400).json({'error message':'this user already has an author account'})
    const [author] = await database.promise().query('INSERT INTO author(username , bio , books_written) VALUES(? , ? , 0)' , [username , bio])
    const author_id = author.insertId
    await database.promise().query('UPDATE users SET is_author = true WHERE username = ?' , [user])
    await database.promise().query('UPDATE users SET author_id = ? WHERE username = ?' , [author_id , user])
    res.cookie('author_id' , author_id , {httpOnly: true})
    return res.status(200).json({'success message' : `author ${username} was added successfully`})
}
const exists = async (username) => {
    const [is_found] = await database.promise().query('SELECT id FROM author WHERE username = ?' , [username])
    if(is_found.length > 0)return true
    return false
}
const books_wrote = async(req , res) => {
    const id = req.body.id
    var books = []
    if(!id) return res.status(401).json({'failure message': 'please provide the required info(author id)'})
    const [author_wrote] = await database.promise().query('SELECT book_id FROM written_by WHERE author_id = ?' , [id])
    const books_written = author_wrote.map(book_ids => book_ids.book_id)
    for(const book of books_written){
        const [book_title] = await database.promise().query('SELECT book_title FROM book WHERE id = ?' , [book])
        books.push(book_title[0]['book_title'])
    }
    if(books.length === 0)return res.status(200).json({'success message': 'We could handle the request successfully' , 'books':'this author did not write any book'})
    return res.status(200).json({'success message':'we could handle the request successfully' , 'books':`${books}`})
}
const update_author_username = async(req , res) => {
    const new_username = req.body.new_username
    const author_id = req.cookies.author_id
    if(!new_username) return res.status(400).json({'error message':'insert the required fields (username)'})
    if(!author_id) return res.status(400).json({'error message':'something went wront user has no author id in the cookies'})
    await database.promise().query('UPDATE author SET username = ? WHERE id = ?' , [new_username , author_id])
    return res.status(200).json({'success message':'username was updated successfully' , 'new username': new_username})
}
module.exports = {
    get_all_authors, 
    get_author,
    add_author,
    books_wrote, 
    update_author_username
}
