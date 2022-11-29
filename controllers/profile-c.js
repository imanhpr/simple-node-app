const {
    validationResult
} = require('express-validator')

const bcrypt = require('bcryptjs')
const {
    Subject,
    Ticket,
    TicketComment,
} = require('../models/Ticket')

const User = require('../models/User')

const {
    messageFromErrorList,
    fromRawList
} = require('../helpers/messagecls')
const sendSms = require('../helpers/melipayamak')
module.exports.getProfile = (request, response) => {
    const msgListObj = messageFromErrorList(request.flash('errors')) ?? fromRawList(request.flash('success'))
    response.render('profile' , {
        csrf_token: request.session.token.token,
        msgListObj:msgListObj
    })
}

module.exports.getSendTicket = (request, response) => {
    return Subject.findAll()
        .then(subjects => {
            const context = {
                subjects: subjects,
                csrf_token: request.session.token.token
            }
            return response.render('profile-send-ticket', context)
        })
}

module.exports.postSendTicket = (request, response) => {
    const {
        title,
        subject,
        content
    } = request.body;
    return Ticket.create({
            content: content,
            title: title,
            UserId: request.session.user.id,
            SubjectId: Number.parseInt(subject)
        })
        .then(ticket => response.redirect('/account/profile'))
        .catch(err => {
            response.redirect('/')
        })
}

module.exports.getTicketList = (request, response) => {
    let query;
    if (request.session.user.rank === 'admin') {
        query = {}
    } else {
        query = {
            UserId: request.session.user.id
        }
    }
    return Ticket.findAll({
            where: query,
            include: Subject,
            order: [
                ['createdAt', 'DESC'],
            ]
        })
        .then(tickts => {
            tickts.map(value => {
                value.farsiDate = new Intl.DateTimeFormat(
                    'fa-IR', {
                        dateStyle: 'long',
                        timeStyle: 'short'
                    }
                ).format(value.createdAt)
            })
            context = {
                tickets: tickts
            };
            return response.render('profile-tickts', context)
        })
}

module.exports.getTicket = (request, response , next) => {
    let query;
    if (request.session.user.rank === 'admin') {
        query = {
            id: request.params.ticketId
        }
    } else {
        query = {
            id: request.params.ticketId,
            UserId: request.session.user.id,
        }
    }
    const msgListObj = messageFromErrorList(request.flash('errors')) ?? fromRawList(request.flash('success'))
    const ticket = Ticket.findOne({
        where: query,
        include: [Subject, TicketComment]
    })
    const comments = TicketComment.findAll({
        where: {
            TicketId: request.params.ticketId,
        },
        include: User,
        order: [
            ['createdAt', 'DESC'],
        ]
    })
    Promise.all([ticket, comments])
        .then(([ticket, comments]) => {
            if (!ticket) {
                return Promise.reject()
            }
            return response.render('ticket', {
                ticket: ticket,
                comments: comments,
                msgListObj: msgListObj,
                csrf_token: request.session.token.token
            })
        })
        .catch(err => {
            const error = new Error('برای ورودی داده شده تیکتی یافت نشد.')
            error.statusCode = 404
            return next(error)
        })
}

module.exports.postTicketComments = (reqeust, response , next) => {
    const ticketId = reqeust.params.ticketId;
    const content = reqeust.body.ticket_comment
    let query;
    if (reqeust.session.user.rank === 'admin') {
        query = {
            id: ticketId
        }
    } else {
        query = {
            id: ticketId,
            UserId: reqeust.session.user.id,
        }
    }
    if (content.length === 0) {
        reqeust.flash('errors', [{
            color: 'red',
            msg: 'فیلد پاسخ نمیتواند خالی باشد.'
        }])
        return response.redirect(reqeust.originalUrl)
    }
    const errors = validationResult(reqeust)
    if (errors.isEmpty()) {
        Ticket.findOne({
                where: query
            })
            .then(ticket => {
                if (!ticket) {
                    const error = new Error('برای ورودی داده شده تیکتی یافت نشد.')
                    error.statusCode = 404
                    return next(error)
                }
                ticket.createTicketComment({
                    content: content,
                    UserId: reqeust.session.user.id
                })
                reqeust.flash('success', [{
                    color: 'green',
                    msg: 'پاسخ شما با موفقیت ثبت شد.'
                }])
                return response.redirect(reqeust.originalUrl)
            })
    } else {
        return response.redirect('/')
    }

}

module.exports.postCloseTicket = (request, response) => {
    if (request.session.user.rank !== 'admin') {
        const error = new Error('شما اجازه دسترسی به این صفحه را ندارید.')
        error.statusCode = 403
        return next(error)
    }
    const {
        ticketId
    } = request.params

    Ticket.update({
        state: 'بسته شده'
    }, {
        where: {
            id: ticketId
        }
    })
    return response.redirect('/account/profile/ticket-list')
}

module.exports.postProfile = (req, res) => {
    const {
        number
    } = req.body
    return User.findOne({
            where: {
                number: number.phoneNumber
            }
        })
        .then(user => {
            if (user) {
                return Promise.reject()
            } else {
                return User.findByPk(req.session.user.id)
            }
        })
        .then(current_user => {
            current_user.set({
                is_phone_active: false,
                number: number.phoneNumber
            })
            current_user.save()
            sendSms(current_user.number , (phoneNumber , sec_code , err) => {
                console.log(`Change number sms has been sent to ${phoneNumber} and sec_code is : ${sec_code} at ${new Date}`)
            })
            return req.session.regenerate(_ => {
                req.flash('success', [{
                    color: 'blue',
                    msg: 'پیامک حاوی کد تایید به شماره تلفن جدید شما ارسال شد.'
                }])
                req.session.phone_activate = current_user.number
                return res.redirect('/account/active')
            })
        }).catch(err => {
            req.flash('errors' , [{
                color:'red',
                msg:'این شماره تلفن قبلا ثبت شده است.'
            }])
            return res.redirect('/account/profile')
        })
}

module.exports.changePassword = (req , res) => {
    const { password } = req.body
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return bcrypt.genSalt(12)
        .then(salt => bcrypt.hash(password , salt))
        .then(hash => {
            return User.update({password : hash} , {where : {id:req.session.user.id}})
        })
        .then(result => {
            req.flash('success' , [{
                color:'green',
                msg:'رمز عبور شما با موفقیت عوض شد و شما میتوانید برای ورود از رمز جدید استفاده کنید.'
            }])
            return res.redirect('/account/profile')
        })
        .catch(err => {
            console.log(err)
            return res.redirect('/account/profile')
        })
    } else {
        req.flash('errors' , errors.array())
        return res.redirect('/account/profile')
    }
}