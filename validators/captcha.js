const arcValidator = require('../helpers/captcha');
const { body , validationResult } = require('express-validator')

module.exports.arcCaptchaValidator = [
    body("arcaptcha-token")
    .custom(input => {
        let sync = true
        let res = null
        arcValidator(input , bool_result => {
            res = bool_result
            sync = false
        })
        while (sync) {require('deasync').sleep(100)}
        return res ? Promise.resolve() : Promise.reject()
    })
    .withMessage("لطفا سوال امنیتی را به صورت صحیح  وارد کنید."),
    (req  , response , next) => {
        const errors = validationResult(req)
        if (errors.isEmpty()) return next()
        req.flash('errors' ,errors.array())
        const url =`${req.protocol}://${req.header('host')}${req.originalUrl}`
        return response.redirect(url)
    }
]