const { body } = require("express-validator");
const { phone } = require("phone");
const bcrypt = require('bcryptjs');
const User = require('../models/User')



const phoneValidator = (input) => {
    const number = phone(input , {country : "IR"})
    if (number.isValid) return true
    else throw new Error('شماره معتبر وارد فرمایید.');
}

const registerValidator = [
    body('number')
    .notEmpty()
    .withMessage("لطفا شماره تلفن همراه خود را وارد کنید.")
    .bail()
    .isNumeric()
    .withMessage("لطفا تلفن همراه را به صورت عددی وارد کنید.")
    .custom(phoneValidator)
    .bail()
    .customSanitizer(input => phone(input , {country : "IR"}))
    .custom(number => {
        return User.findOne({where:{number : number.phoneNumber}})
        .then(user => user ? Promise.reject() : Promise.resolve())
    })
    .withMessage("اکانتی با این شماره تلفن همراه قبلا ثبت شده است."),
    body('password')
    .notEmpty()
    .withMessage('فیلد پسورد نمیتواند خالی باشد.')
    .bail()
    .isLength({min : 6})
    .withMessage('طول پسورد حداقل باید 6 کارکتر باشد.')
    .bail(),
    body('news_active')
    .customSanitizer(input => {
        return Boolean(input)
    })
]
const loginValidator = [
    body('password')
    .notEmpty()
    .withMessage('فیلد پسورد نمیتواند خالی باشد.')
    .bail()
    .isLength({min : 6})
    .withMessage('طول پسورد حداقل باید 6 کارکتر باشد.')
    .bail(),

    body('number')
    .notEmpty()
    .withMessage("لطفا شماره تلفن همراه خود را وارد کنید.")
    .bail()
    .isNumeric()
    .withMessage("لطفا تلفن همراه را به صورت عددی وارد کنید.")
    .custom(phoneValidator)
    .bail()
    .customSanitizer(input => phone(input , {country : "IR"}))
    .custom((number , {req}) => {
        return User.findOne({where: {number : number.phoneNumber}})
        .then(user => {
            if (!user){
                return Promise.reject()
            }
            return user
        })
        .then(user => {
            if(!bcrypt.compareSync(req.body.password , user.password)) return Promise.reject()
            req.user = user;
        })
    })
    .withMessage('شماره تلفن همراه یا پسورد صحیح نمیباشد.')
]

const forgetValidator = [
    body('number')
    .notEmpty()
    .withMessage("لطفا شماره تلفن همراه خود را وارد کنید.")
    .bail()
    .isNumeric()
    .withMessage("لطفا تلفن همراه را به صورت عددی وارد کنید.")
    .custom(phoneValidator)
    .bail()
    .customSanitizer(input => phone(input , {country : "IR"})),
]
const passwordValidator = [
    body('password')
    .notEmpty()
    .withMessage('فیلد پسورد نمیتواند خالی باشد.')
    .bail()
    .isLength({min : 6})
    .withMessage('طول پسورد حداقل باید 6 کارکتر باشد.')
    .bail(),
]

module.exports.registerValidator = registerValidator;
module.exports.loginValidator = loginValidator;
module.exports.forgetValidator = forgetValidator;
module.exports.passwordValidator = passwordValidator;