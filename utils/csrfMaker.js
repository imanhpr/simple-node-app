const Csrf = require("csrf");


module.exports.setToken = (request, response, next) => {
    const csrf = new Csrf

    csrf.secret((err, key) => {
        if (err) return next(err)
        request.session.token = {
            key: key,
            token: csrf.create(key)
        }
        return next()
    })
}

module.exports.validateToken = (req, res, next) => {
    if (!req.session.token) return next(new Error('req.session.token doesn\' exsist'))
    const csrf = new Csrf
    const {
        csrf_token
    } = req.body
    if (csrf.verify(req.session.token.key, csrf_token)) return next()
    else{

        const err = new Error('CSRF_Token is invalid')
        err.statusCode = 422
        return next(err)
    }
}