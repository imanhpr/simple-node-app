const bcrypt = require('bcryptjs');
const {
    validationResult
} = require('express-validator')

const {ACTIVATE_MAP , FORGET_SET} = require('../utils/constants')
const sendSms = require('../helpers/melipayamak');
const { sendPasswordSms } = require('../helpers/melipayamak')

const {messageFromErrorList , fromRawList} = require('../helpers/messagecls');
const { genPassword  , addToForgetSet} = require('../helpers/forgetpass')
const User = require('../models/User');
const ARC_SITE_KEY = process.env.ARC_SITE_KEY

module.exports.getLogin = (request, response) => {
    const msgListObj = messageFromErrorList(request.flash('errors')) ?? fromRawList(request.flash('success'))
    const context = {
        title: 'ورود به حساب کاربری',
        btn: 'ورود',
        messageListObj: msgListObj,
        csrf_token: request.session.token.token,
        ARC_SITE_KEY:ARC_SITE_KEY,
    }
    response.render('auth.ejs', context)
}
module.exports.postLogin = (request, response) => {
    const errors = validationResult(request)
    if (errors.isEmpty()) {
        if (request.user.is_phone_active) {
            request.session.user = request.user;
            return response.redirect('/account/profile')
        } else {
            request.session.phone_activate = request.user.number
            request.flash('errors' , [{
                color:'red',
                msg :'اکانت شما ثبت شده ولی فعال نیست. لطفا از این فرم جهت فعال سازی اقدام فرمایید.'
            }])
            if (!ACTIVATE_MAP.has(request.user.number)){
                sendSms(request.user.number , (phone_number , _ , err) => {
                    if (err){
                        console.error(err)
                        return
                    }
                    console.log(`login feild for user id-${request.user.id} - ${new Date} - New Sms has just sent.`)
                })
            } else {
                console.log(`There is Activation sms on ACTIVE_MAP for number ${request.user.number}`)
            }
            return response.redirect('/account/active')
        }

    } else {
        request.flash('errors' , errors.array())
        response.redirect('/account/login')
    }
}
module.exports.getRegister = (request, response) => {
    const msgListObj = messageFromErrorList(request.flash('errors')) ?? fromRawList(request.flash('success'))

    const context = {
        title: 'ثبت نام حساب کاربری جدید',
        btn: 'ثبت نام',
        messageListObj : msgListObj,
        csrf_token: request.session.token.token,
        ARC_SITE_KEY:ARC_SITE_KEY,
    }
    response.render('auth.ejs', context)
}
module.exports.postRegister = (request, response) => {
    const {
        password: rawPassword,
        number,
        news_active
    } = request.body
    const errors = validationResult(request)
    if (errors.isEmpty()) {
        bcrypt.genSalt(12)
        .then(salt => bcrypt.hash(rawPassword ,salt))
        .then(hashedPassword => {
            return User.create({number:number.phoneNumber , password:hashedPassword , send_news:news_active})
        })
        .then(user => {
            if (user.id && user.createdAt) {
                const numberToAlert = '0' + user.number.slice(3)
                request.session.phone_activate = user.number
                request.flash('success' , [{
                color : 'green',
                    msg : `کد فعال سازی به شماره ${numberToAlert} با موفقیت ارسال شد.`
                }])
                sendSms(user.number , (phoneNumber , sec_code , err) => {
                    console.log(`Sms has send to ${user.number} at ${new Date} `)
                })
                return response.redirect('/account/active')
            }
            Promise.reject()
        })
        .catch(err => {
            console.error(err);
            return response.redirect('/account/register');
        })
    } else {
        request.flash('errors' , errors.array())
        return response.redirect('/account/register');
    }
}
module.exports.getLogout = (request, response) => {
    request.session.destroy()
    return response.redirect('/')
}

module.exports.getPhoneActive = (request , response , next) => {
    if (!request.session?.phone_activate){
        const err = new Error('شما اجازه دسترسی به این صفحه را ندارید.')
        err.statusCode = 403
        return next(err)
    }
    const msgListObj = messageFromErrorList(request.flash('errors')) ?? fromRawList(request.flash('success'))
    const context = {
        messageListObj: msgListObj,
        phone_activate : request.session?.phone_activate,
        csrf_token: request.session.token.token,
    }
    return response.render('active_form' , context)
}
module.exports.postPhoneActive = (request , response) => {
    if (!request.session?.phone_activate){
        const err = new Error('شما اجازه دسترسی به این صفحه را ندارید.')
        err.statusCode = 403
        return next(err)
    }
    const number = request.session.phone_activate
    if (ACTIVATE_MAP.get(number) !== request.body.code){
        request.flash('errors' , [{
            color:'red',
            msg:'کد فعال سازی شما معتبر نمیباشد لطفا کد صحیح وارد فرمایید.'
        }])
        return response.redirect('/account/active')
    } else{
        return User.findOne({where : {number : number}})
        .then(user => {
            user.is_phone_active = true;
            const numberToAlert = '0' + user.number.slice(3)
            user.save()
            request.flash('success' , [{
                color:'green',
                msg:`اکانت شما با شماره ${numberToAlert} با موفقیت فعال شد و هم اکنون میتوانید وارد شوید.`
            }])
            delete request.session.phone_activate
            return response.redirect('/account/login');
        })
    }
}


module.exports.postResendSms = (request , response) => {
    if (!request.session?.phone_activate){
        return response.status(403).json({'message' : 'unauthorized'})
    }
    const {number} = request.body

    if (number !== request.session.phone_activate){
        return response.status(400).json({'message' : 'error'})
    }
    if (ACTIVATE_MAP.has(request.session.phone_activate)) {
        return response.status(425).json({'message' : 'to Fast'})
    }

    sendSms(request.session.phone_activate , (_ , __ , err) => {
        if (err) console.error(`Error For resend | ${new Date} : `, err)
    })
    console.log(`Sms has resent to ${request.session.phone_activate} at ${new Date}`)
    response.json({'message' : 'success'})
}

module.exports.getForgetPassword = (req , res) => {
    const msgListObj = messageFromErrorList(req.flash('errors')) ?? fromRawList(req.flash('success'))
    res.render('forgetpass' , {messageListObj:msgListObj})
}
module.exports.postForgetPassword = (req , res) => {
    const { number } = req.body
    if (FORGET_SET.has(number.phoneNumber)) {
        req.flash('success' , [{
            color:"blue",
            msg:'شما از قبل یک درخواست در حال پردازش دارید. لطفا کمی صبر کنید.'
        }])
        return res.status(425).redirect(req.originalUrl)
    }
    return User.findOne({where : {number : number.phoneNumber}})
    .then(user => {
        if (!user) {
            req.flash('success' , [{
                color:'yellow',
                msg:'در صورت درست بودن شماره تلفن همراه، رمز عبور جدید برای شما ارسال میشود.'
            }])
            return res.redirect(req.originalUrl)
        }
        return genPassword()
        .then(({hash , pass}) => {
            user.set({password : hash})
            user.save()
            addToForgetSet(user.number)
            console.log(`Reseted password for User ${user.number} : ${pass}}`)
            sendPasswordSms(user.number , pass.toString())
            req.flash('success' , [{
                color:'green',
                msg : 'پسورد جدید با موفقیت به تلفن همراه شما ارسال شد.'
            }])
            return res.redirect('/account/login')
        })
    })
}