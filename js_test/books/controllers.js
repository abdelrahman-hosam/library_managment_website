const http = require('http')
const mysql2 = require('mysql2')
const database = mysql2.createConnection(

)
const get_all_books = async (req , res) => {
    const [books] = await database.promise().query('SELECT * FROM book')
    if(!books) return res.status(400).json({'failure message':'We could not retrieve the books from the data base'})
    return res.status(200).json({'success message':'books were retrived successflly' , 'books':books})
}
const get_book = async (req , res) =>{
    const titles = req.body.titles
    const books = []
    if(!Array.isArray(titles)) return res.status(400).json({'error message': 'please insert the book title(s) you want in array data structure'})
    for(const title of titles) {
        const [retrieved] = await database.promise().query('SELECT * FROM book WHERE INSTR(book_title , ?) > 0' , [title])
        books.push(...retrieved)
    }
    if(books.length === 0) return res.status(404).json({'error message': 'there are no books with the title(s) you inserted try other titles'})
    return res.status(200).json({'success message': 'The book(s) you were searching for were retrieved successfully' , 'book':books})
}
const add_book = async (req , res) => {
    const book_title = req.body.book_title , authors_req = req.body.authors
    var published_at = req.body.published_at
    var genres = req.body.genres
    var des = null
    const authors = []
    if(req.body.desription)des = req.body.desription
    if(!book_title || !genres || !authors) return res.status(401).json({'error message':'insert the required data (book title , authors , genres)'})
    if(!published_at){
        const date = new Date() , day = date.getDate(), month = date.getMonth() + 1, year = date.getFullYear()
        published_at = `${year}-${month}-${day}`
    }
    for(const author of authors_req){
        authors.push(Number(author))
    }
    const [inserted_book] = await database.promise().query('INSERT INTO book(book_title , published_at , description) VALUES(? ,?, ?)' , [book_title , published_at , des])
    const book_id = inserted_book.insertId 
    const authors_added = await control_authors(book_id , authors)
    if(!authors_added['valid']) return res.status(500).json({'error message': authors_added['result']})
    if(!genres || !Array.isArray(genres)) return res.status(200).json({'success message': 'the book was added without genres'})
    for(const genre of genres){
        await database.promise().query('INSERT INTO book_generes(book_id , genere) VALUES(? ,?)' , [book_id , genre])
    }
    return res.status(200).json({'success message':`${book_title} was added successfully with the genres and authors attached to it`})
}
const control_authors = async (book_id , authors_ids) => {
    if(!Array.isArray(authors_ids)) return {'result': 'Not valid input please insert an array' , 'valid': false}
    const [authors] = await database.promise().query('SELECT id FROM author');
    const authors_array = authors.map(author => author.id);
    var not_found = []
    for(const id of authors_ids){
        if(!authors_array.includes(id)) not_found.push(id)
    }
    if(not_found.length > 0)return {'result': `could not find the IDs of authors ${not_found}` , 'valid': false}
    for(const id of authors_ids){
    await database.promise().query('INSERT INTO written_by(book_id , author_id) VALUES(? , ?)' , [book_id , id])
    }
    return {'result': 'authors were successfully added' , 'valid': true}
}
const borrow_book =async (req , res) =>{
    const book_id = req.body.id 
    const [book] = await database.promise().query('SELECT status FROM book WHERE id = ?' , [book_id])
    if(book.length === 0)return res.status(404).json({'error message': 'The book was not found'})
    const book_status = book[0].status
    if(book_status !== 'available') return res.status(400).json({'error message': 'The book is not available'})
    await database.promise().query(`UPDATE book SET status = 'borrowed' WHERE id = ?` , [book_id])
    return res.status(200).json({'success message': 'the book was borrowed successfully'})
}
const book_exist = async (book_id) => {
    const [book] = await database.promise().query('SELECT * FROM book WHERE id = ?' , [book_id])
    if(!book) return false
    return true
}
const valid_for_update = async(req) =>{
    const book_id = req.body.book_id , author_id = req.body.author_id
    if(!author_id || !book_id || !Array.isArray(author_id)) return {'valid':false , 'error':'please insert the required data (author id , book id) or check if you sent the author ids as an array' , 'status': 400}
    if(!await book_exist(book_id) || !await authors_exist(author_id)) return {'valid':false , 'error':'author or book you sent does not exist', 'status': 404}
    return {'valid': true , 'author_id': author_id , 'book_id': book_id}
}
const authors_exist = async(author_ids) =>{
    const [author] = await database.promise().query('SELECT id FROM author WHERE id IN(?)' , [author_ids])
    const authors = author.map(author_info => author.id)
    return authors.length === author_ids.length
}
const add_authors = async (req , res) => {
    const result = await valid_for_update(req)
    const added_authors = []
    if(!result['valid']) return res.status(result['status']).json({'error message': result['error']})
    const book_id = result['book_id'] , author_ids = result['author_id']
    for(id of author_ids){
        const [is_found] = await database.promise().query('SELECT author_id FROM written_by WHERE book_id = ? AND author_id = ?' , [book_id , id])
        if(is_found.length === 0){
            await database.promise().query('INSERT INTO written_by(book_id , author_id) VALUES (? , ?)' , [book_id , id])
            added_authors.push(id)
        }
    }
    if(added_authors.length === 0) return res.status(200).json({'success message':'your request were successfully handled but no authors were added' , 'reason':'maybe the authors you wanted to add are already attached to the book'})
    return res.status(200).json({'success message': 'the author were successfully added to the book'}) 
}
const remove_authors = async(req , res) => {
    const result = valid_for_update(req)
    if(!result['valid']) return res.status(result['status']).json({'error message': result['error']})
    const book_id = result['book_id'] , author_ids = result['author_id']
    for(id of author_ids){
        await database.promise().query('DELETE FROM written_by WHERE book_id = ? AND author_id = ?' , [book_id , id])
    }
    return res.status(200).json({'success message': 'the author were successfully added to the book'}) 
}
const update_authors = async(req , res) => {
    const result = valid_for_update(req)
    if(!result['valid']) return res.status(result['status']).json({'error message': result['error']})
    const book_id = result['book_id'] , author_ids = result['author_id']
    await database.promise().query('DELETE FROM written_by WHERE book_id = ?' , [book_id])
    for(id of author_ids){
        await database.promise().query('INSERT INTO written_by(book_id , author_id) VALUES(?,?)' , [book_id , id])
    }
    return res.status(200).json({'success message': 'the author were successfully added to the book' , 'authors added': author_ids}) 
}
module.exports = {
    get_all_books ,
    get_book ,
    add_book,
    borrow_book, 
    add_authors,
    update_authors,
    remove_authors
}
