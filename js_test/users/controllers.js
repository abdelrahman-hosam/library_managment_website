const mysql2 = require('mysql2')
const bcrypt = require('bcrypt')
const http = require('http')
const dotenv = require('dotenv').config()
const generate_tokens = require('./generateTokens')
const database = mysql2.createConnection(
    {
        host: 'localhost',
        user: 'root',  
        password: 'bobo232324',
        database: 'library_api',
    }
)

const create_new_user = async (req , res) => {
    const username = req.body.username
    const password = req.body.password
    if(!username|| !password) return res.status(400).json({'error': 'username and password are required'})
    const [is_repeated] = await database.promise().query('SELECT * FROM users where username = ?' , [username])
    if(is_repeated.length > 0) return res.status(400).json({'error': 'username already exists'})
    const hashedpass = bcrypt.hashSync(password , 10)
    await database.promise().query(`INSERT INTO users (username , password) VALUES(? , ?)` , [username , hashedpass])
    return res.status(201).json({'success message': `a user was created successfully with username ${username}`})
}
const login_user = async (req , res) => {
    const username = req.body.username
    const password = req.body.password
    if(!username || !password) return res.status(400).json({'error': 'username and password are required'})
    const [user] = await database.promise().query('SELECT * FROM users where username = ?' , [username])
    if(user.length === 0) return res.status(404).json({'error':'user does not exist'})
    if(bcrypt.compareSync(password , user[0].password)) {
        await database.promise().query('UPDATE users SET is_active = true WHERE username = ? ' , [username])
        const [access_token , refresh_token] = generate_tokens.generate_jwt_tokens(username)
        res.cookie('access_token' , access_token , {httpOnly: true  , maxAge: 15 * 60 * 1000})
        res.cookie('refresh_token' , refresh_token , {httpOnly: true  , maxAge: 60 * 60 * 1000})
        res.cookie('username' , username , {httpOnly: true })
        const [is_author] = await database.promise().query('SELECT author_id FROM users WHERE username = ?' , [username])
        if(is_author.length > 0) res.cookie('author_id' , is_author[0]['author_id'] , {httpOnly: true})
        return res.status(200).json({'success message':`user ${username} has logged in successfully` , 'access_token': access_token})
    }
    else return res.status(400).json({'error':'password is incorrect'})
}
const new_access = (req , res) => {
    return generate_tokens.create_access_token(req , res)
}
const logout = async (req , res) =>{
    const username = req.cookies.username
    const is_active = await database.promise().query('SELECT is_active FROM users WHERE username = ? ' , [username])
    if(!username || !is_active) return res.status(400).json({'failure message': 'user is not longer logged in'})
    await database.promise().query('UPDATE users SET is_active = false WHERE username = ? ' , [username])
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    res.clearCookie('username')
    return res.status(200).json({'success message': 'user logged out successfully'})    
}
const change_password = async (req , res) => {
    const username = req.cookies.username
    const new_password = req.body.new_password
    const user = await database.promise().query('SELECT * FROM users WHERE username = ?' , [username])
    if(!user) return res.status(404).json({'error message':'user was not found'})
    const hashed_password = bcrypt.hashSync(new_password , 10)
    await database.promise().query('UPDATE users SET password = ? WHERE username = ? ' , [hashed_password, username])
}
module.exports = {
    create_new_user,
    login_user , 
    new_access,
    logout,
    change_password
}