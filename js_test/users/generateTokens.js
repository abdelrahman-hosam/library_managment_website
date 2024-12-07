const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const generate_jwt_tokens = (username) => {
    const access_token = jwt.sign({username: username} , process.env.ACCESS_TOKEN_SECRET)
    const refresh_token = jwt.sign({username: username} , process.env.REFRESH_TOKEN_SECRET , {expiresIn: '1h'})
    return [access_token , refresh_token]
}
const create_access_token = (req , res) => {
    const refresh_token = req.cookies.refresh_token
    const username = req.cookies.username
    if(!refresh_token || !username) return res.sendStatus(400)
    const is_user = jwt.verify(refresh_token , process.env.REFRESH_TOKEN_SECRET)
    if(!is_user) return res.sendStatus(500)
    const access_token = jwt.sign({username: username} , process.env.ACCESS_TOKEN_SECRET , {expiresIn: '15m'})
    res.clearCookie('access_token')
    res.cookie('access_token' , access_token , {httpOnly: true  , maxAge: 15 * 60 * 1000})
    return res.status(200).json({'success message': `new access token was generated ${access_token}`})
}
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.access_token? req.cookies.access_token:undefined
    if (!token) {
        return res.status(401).json({ 'error message': 'Unauthorized' })
    }
    next()
}
module.exports = {
    generate_jwt_tokens,
    create_access_token,
    authenticateJWT
}