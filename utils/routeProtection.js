module.exports.isAuth = (request , response, next) => {
    if (!request.session.user) {
        const err = new Error('شما اجازه دسترسی به این صفحه ندارید.')
        err.statusCode = 403
        return next(err)
    }
    next()
}

module.exports.isNotAuth = (request , response , next) => {
    if (request.session.user) {
        const err = new Error('شما اجازه دسترسی به این صفحه ندارید.')
        err.statusCode = 403
        return next(err)
    }
    next()
}